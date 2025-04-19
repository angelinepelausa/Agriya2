import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { height } = Dimensions.get('window');

const EmptyState = ({ message }) => (
  <View style={styles.emptyContainer}>
    <Image 
      source={require('../assets/EmptyBox.png')} 
      style={styles.emptyImage} 
      resizeMode="contain"
    />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const PurchasesScreen = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState('to_pay');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      navigation.goBack();
      return;
    }

    const fetchUsername = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setCurrentUsername(userDoc.data().username);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, []);

  useEffect(() => {
    if (!currentUsername) return;

    setLoading(true);

    const unsubscribe = firestore()
      .collection('orders')
      .doc(currentUsername) 
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const userOrders = doc.data().orders || [];
            const filteredOrders = userOrders.filter(
              (order) => order.status === activeTab
            );
            setOrders(filteredOrders);
          } else {
            setOrders([]);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching orders:", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [currentUsername, activeTab]); 
  
    const getEmptyMessage = () => {
      switch (activeTab) {
        case 'to_pay':
          return 'No orders to pay';
        case 'to_ship':
          return 'No orders to ship';
        case 'to_receive':
          return 'No orders to receive';
        case 'completed':
          return 'No completed orders';
        case 'cancelled':
          return 'No cancelled orders';
        default:
          return 'No orders yet';
      }
    };
  
    const renderContent = () => {
      if (loading) {
        return <ActivityIndicator size="large" color="#11AB2F" style={styles.loadingIndicator} />;
      }
    
      if (orders.length === 0) {
        return <EmptyState message={getEmptyMessage()} />;
      }
    
      return (
        <View style={styles.ordersContainer}>
          {orders.map(order => (
  <TouchableOpacity 
    key={order.id} 
    onPress={() => navigation.navigate('OrderDetails', { order })}
  >
    <View style={styles.orderCard}>
      <Text style={styles.shopName}>{order.sellerUsername || 'Seller'}</Text>
              
              {order.items.map((item, index) => (
                <View key={`${item.productId}_${index}`} style={styles.orderItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.orderItemImage} />
                  <View style={styles.orderItemDetails}>
                    <Text style={styles.orderItemName}>{item.productName}</Text>
                    <Text style={styles.orderItemPrice}>₱{item.price.toFixed(2)}</Text>
                    <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.orderItemTotal}>₱{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
              
              <View style={[styles.orderSummaryRow, styles.orderTotalRow]}>
                <Text style={[styles.orderSummaryLabel, styles.orderTotalLabel]}>Total:</Text>
                <Text style={[styles.orderSummaryValue, styles.orderTotalValue]}>₱{order.total.toFixed(2)}</Text>
              </View>
            </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.topRectangle}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>&lt;</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>My Purchases</Text>
          </View>
  
          <View style={styles.tabsOuterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.tabsContainer}
              contentContainerStyle={styles.tabsContentContainer}
            >
              <TouchableOpacity 
                style={styles.tab}
                onPress={() => setActiveTab('to_pay')}
              >
                <Text style={[styles.tabText, activeTab === 'to_pay' && styles.activeTabText]}>To Pay</Text>
                <View style={[styles.tabBottomLine, activeTab === 'to_pay' && styles.activeTabBottomLine]} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tab}
                onPress={() => setActiveTab('to_ship')}
              >
                <Text style={[styles.tabText, activeTab === 'to_ship' && styles.activeTabText]}>To Ship</Text>
                <View style={[styles.tabBottomLine, activeTab === 'to_ship' && styles.activeTabBottomLine]} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tab}
                onPress={() => setActiveTab('to_receive')}
              >
                <Text style={[styles.tabText, activeTab === 'to_receive' && styles.activeTabText]}>To Receive</Text>
                <View style={[styles.tabBottomLine, activeTab === 'to_receive' && styles.activeTabBottomLine]} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tab}
                onPress={() => setActiveTab('completed')}
              >
                <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
                <View style={[styles.tabBottomLine, activeTab === 'completed' && styles.activeTabBottomLine]} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tab}
                onPress={() => setActiveTab('cancelled')}
              >
                <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>Cancelled</Text>
                <View style={[styles.tabBottomLine, activeTab === 'cancelled' && styles.activeTabBottomLine]} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
  
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {renderContent()}
        </ScrollView>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(240, 243, 242)',
  },
  topRectangle: {
    width: '100%',
    height: height * 0.18, 
    backgroundColor: '#11AB2F',
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  backArrow: {
    fontSize: 24,
    color: '#f8f8f8', 
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5f5f5',
    marginLeft: 10,
  },
  tabsOuterContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tabsContainer: {
    height: 40,
  },
  tabsContentContainer: {
    paddingHorizontal: 10,
  },
  tab: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(248, 248, 248, 0.8)', 
  },
  activeTabText: {
    color: '#f5f5f5', 
    fontWeight: '600',
  },
  tabBottomLine: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    backgroundColor: 'transparent',
  },
  activeTabBottomLine: {
    backgroundColor: '#f8f8f8', 
  },
  contentContainer: {
    flexGrow: 1,
    padding: 15,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  orderCard: {
    backgroundColor: '#fafafa', 
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#11AB2F',
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111', 
  },
  orderItemPrice: {
    fontSize: 12,
    color: '#11AB2F',
    marginTop: 2,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#5D5C5C',
    marginTop: 2,
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a', 
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: '#5D5C5C',
  },
  orderSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderTotalRow: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  orderTotalLabel: {
    fontWeight: 'bold',
  },
  orderTotalValue: {
    fontWeight: 'bold',
    color: '#11AB2F',
    fontSize: 16,
  },
});

export default PurchasesScreen;