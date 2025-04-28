import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Image, ActivityIndicator} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { height } = Dimensions.get('window');

const EmptyState = ({ message }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const formatBuyerStatus = (status) => {
  switch (status) {
    case 'to_pay': return 'is pending confirmation';
    case 'to_ship': return 'is being prepared for shipping';
    case 'to_receive': return 'has been shipped';
    case 'completed': return 'has been completed';
    case 'cancelled': return 'has been cancelled';
    default: return `has an updated status: ${status}`;
  }
};

const formatSellerStatus = (status) => {
  switch (status) {
    case 'upcoming': return 'is new and awaiting confirmation';
    case 'to_ship': return 'needs to be shipped';
    case 'shipped': return 'has been shipped';
    case 'completed': return 'has been completed';
    case 'cancelled': return 'has been cancelled';
    default: return `has an updated status: ${status}`;
  }
};

const formatTimestamp = (isoString) => {
    if (!isoString) return 'just now'; 
    try {
        const date = new Date(isoString);
        const timeDiff = new Date() - date;
        const minutes = Math.floor(timeDiff / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'a while ago';
    }
};

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      console.log("No user logged in, navigating back.");
      navigation.goBack();
      return;
    }

    const fetchUsername = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const username = userDoc.data().username;
          console.log("Fetched username:", username);
          setCurrentUsername(username);
        } else {
          console.log("User document not found for UID:", user.uid);
          setLoading(false); 
        }
      } catch (error) {
        console.error("Error fetching username:", error);
        setLoading(false); 
      }
    };

    fetchUsername();
  }, [navigation]); 

  useEffect(() => {
    if (!currentUsername) {
      if (loading && !auth().currentUser) {
         setLoading(false);
      }
      return;
    }

    setLoading(true); 
    console.log(`Subscribing to orders for username: ${currentUsername}`);

    const unsubscribeBuyer = firestore()
      .collection('orders')
      .doc(currentUsername)
      .onSnapshot(
        (doc) => {
          console.log("Received buyer order snapshot update.");
          if (doc.exists) {
            const userData = doc.data();
            const userOrders = userData.orders || [];
            console.log(`Found ${userOrders.length} buyer orders.`);

            const buyerNotifications = userOrders.map(order => ({
              id: `buyer_${order.transactionId}`,
              transactionId: order.transactionId,
              status: order.status,
              timestamp: order.updatedAt || order.createdAt || new Date().toISOString(),
              imageUrl: order.items?.[0]?.imageUrl,
              fullOrder: order,
              type: 'buyer'
            }));

            setNotifications(prev => {
              const sellerNotifs = prev.filter(n => n.type === 'seller');
              return [...sellerNotifs, ...buyerNotifications].sort((a, b) => {
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                return dateB - dateA;
              });
            });
          } else {
            console.log(`Buyer order document for ${currentUsername} does not exist.`);
            setNotifications(prev => prev.filter(n => n.type === 'seller'));
          }
          setLoading(false); 
        },
        (error) => {
          console.error("Error fetching buyer orders snapshot:", error);
          setNotifications(prev => prev.filter(n => n.type === 'seller'));
          setLoading(false); 
        }
      );

    const unsubscribeSeller = firestore()
      .collection('sellerOrders')
      .doc(currentUsername)
      .onSnapshot(
        (doc) => {
          console.log("Received seller order snapshot update.");
          if (doc.exists) {
            const sellerData = doc.data();
            const sellerOrders = sellerData.orders || [];
            console.log(`Found ${sellerOrders.length} seller orders.`);

            const sellerNotifications = sellerOrders.map(order => ({
              id: `seller_${order.transactionId}`,
              transactionId: order.transactionId,
              status: order.status,
              timestamp: order.updatedAt || order.createdAt || new Date().toISOString(),
              imageUrl: order.items?.[0]?.imageUrl,
              fullOrder: order,
              type: 'seller'
            }));

            setNotifications(prev => {
              const buyerNotifs = prev.filter(n => n.type === 'buyer');
              return [...buyerNotifs, ...sellerNotifications].sort((a, b) => {
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                return dateB - dateA;
              });
            });
          } else {
            console.log(`Seller order document for ${currentUsername} does not exist.`);
            setNotifications(prev => prev.filter(n => n.type === 'buyer'));
          }
          setLoading(false); 
        },
        (error) => {
          console.error("Error fetching seller orders snapshot:", error);
          setNotifications(prev => prev.filter(n => n.type === 'buyer'));
          setLoading(false); 
        }
      );

    return () => {
      console.log("Unsubscribing from order updates.");
      unsubscribeBuyer();
      unsubscribeSeller();
    };
  }, [currentUsername]); 

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => {
        console.log("Navigating to details for:", item.transactionId);
        navigation.navigate('OrderDetails', { 
          order: item.fullOrder,
          isSellerOrder: item.type === 'seller'
        });
      }}
    >
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : null} 
        style={styles.notificationImage}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          {item.type === 'buyer' ? (
            <>Your order <Text style={styles.boldText}>{item.transactionId}</Text> {formatBuyerStatus(item.status)}.</>
          ) : (
            <>Order <Text style={styles.boldText}>{item.transactionId}</Text> {formatSellerStatus(item.status)}.</>
          )}
        </Text>
        <Text style={styles.notificationTime}>
          {formatTimestamp(item.timestamp)} 
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Notifications</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#11AB2F" />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <EmptyState message="You have no notifications yet." />
      )}

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeScreen')}>
          <Image
            source={require('../assets/Home.png')}
            style={styles.navImage}
          />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MarketplaceScreen')}>
          <Image
            source={require('../assets/Marketplace.png')}
            style={styles.navImage}
          />
          <Text style={styles.navText}>Marketplace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NotificationScreen')}>
          <Image
            source={require('../assets/NotificationsGreen.png')}
            style={styles.navImage}
          />
          <Text style={[styles.navText, { color: '#11AB2F' }]}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProfileScreen')}>
          <Image
            source={require('../assets/Profile.png')}
            style={styles.navImage}
          />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f2',
  },
  topRectangle: {
    width: '100%',
    height: height * 0.13, 
    backgroundColor: '#11AB2F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40, 
  },
  backButton: {
    padding: 10,
    marginRight: 5, 
  },
  backArrow: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  notificationItem: {
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  boldText: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navImage: {
    width: 24,
    height: 24,
  },
  navText: {
    fontSize: 10,
    color: '#1B1A12',
  },
});

export default NotificationScreen;