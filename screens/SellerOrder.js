import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, ActivityIndicator, Alert } from 'react-native';
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

const SellerOrder = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'upcoming');
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
      .collection('sellerOrders')
      .doc(currentUsername)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const sellerOrders = doc.data().orders || [];
            const filteredOrders = sellerOrders.filter(
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

  const restoreProductStock = async (productId, quantityToRestore) => {
    try {
      const productQuery = await firestore()
        .collection('products')
        .where('productId', '==', productId)
        .get();
      
      if (productQuery.empty) {
        console.warn(`Product with ID ${productId} not found`);
        return;
      }

      const productDoc = productQuery.docs[0];
      const currentStock = productDoc.data().stock;

      await productDoc.ref.update({
        stock: currentStock + quantityToRestore
      });

    } catch (error) {
      console.error("Error restoring product stock:", error);
    }
  };

  const handleStatusUpdate = async (transactionId, newStatus) => {
    try {
      const orderToUpdate = orders.find(order => order.transactionId === transactionId);
      if (!orderToUpdate) {
        Alert.alert('Error', 'Order not found');
        return;
      }

      const batch = firestore().batch();

      const sellerDocRef = firestore().collection('sellerOrders').doc(currentUsername);
      const sellerDoc = await sellerDocRef.get();

      if (sellerDoc.exists) {
        const updatedSellerOrders = sellerDoc.data().orders.map(order => 
          order.transactionId === transactionId ? { ...order, status: newStatus.sellerStatus } : order
        );
        batch.update(sellerDocRef, { orders: updatedSellerOrders });
      }

      const allOrdersDocs = await firestore().collection('orders').get();
      
      let foundOrder = false;
      allOrdersDocs.forEach(userDoc => {
        const userOrders = userDoc.data().orders || [];
        const updatedOrders = userOrders.map(order => {
          if (order.transactionId === transactionId) {
            foundOrder = true;
            return { ...order, status: newStatus.mainStatus };
          }
          return order;
        });

        if (updatedOrders.some(o => o.transactionId === transactionId)) {
          batch.update(userDoc.ref, { orders: updatedOrders });
        }
      });

      if (newStatus.sellerStatus === 'cancelled') {
        for (const item of orderToUpdate.items) {
          await restoreProductStock(item.productId, item.quantity);
        }
      }

      await batch.commit();
      Alert.alert('Success', newStatus.successMessage);
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert('Error', `Failed to update order status: ${error.message}`);
    }
  };

  const handleConfirmOrder = (transactionId) => {
    handleStatusUpdate(transactionId, {
      sellerStatus: 'to_ship',
      mainStatus: 'to_ship',
      successMessage: 'Order confirmed and ready to ship'
    });
  };

  const handleMarkAsShipped = (transactionId) => {
    handleStatusUpdate(transactionId, {
      sellerStatus: 'shipped',
      mainStatus: 'to_receive',
      successMessage: 'Order marked as shipped!'
    });
  };

  const handleCancelOrder = (transactionId) => {
    handleStatusUpdate(transactionId, {
      sellerStatus: 'cancelled',
      mainStatus: 'cancelled',
      successMessage: 'Order has been cancelled'
    });
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'upcoming': return 'No upcoming orders';
      case 'to_ship': return 'No orders to ship';
      case 'shipped': return 'No shipped orders';
      case 'completed': return 'No completed orders';
      case 'cancelled': return 'No cancelled orders';
      default: return 'No orders yet';
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
            key={order.transactionId} 
            onPress={() => navigation.navigate('OrderDetails', { order })}
          >
            <View style={styles.orderCard}>
              <Text style={styles.customerName}>{order.customerInfo.name}</Text>
              
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

              {activeTab === 'upcoming' && (
                <View style={styles.buttonGroup}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={() => handleConfirmOrder(order.transactionId)}
                  >
                    <Text style={styles.actionButtonText}>Confirm Order</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancelOrder(order.transactionId)}
                  >
                    <Text style={styles.actionButtonText}>Cancel Order</Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'to_ship' && (
                <View style={styles.buttonGroup}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.shipButton]}
                    onPress={() => handleMarkAsShipped(order.transactionId)}
                  >
                    <Text style={styles.actionButtonText}>Mark as Shipped</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancelOrder(order.transactionId)}
                  >
                    <Text style={styles.actionButtonText}>Cancel Order</Text>
                  </TouchableOpacity>
                </View>
              )}
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
          <Text style={styles.pageTitle}>Orders</Text>
        </View>

        <View style={styles.tabsOuterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContentContainer}
          >
            {['upcoming', 'to_ship', 'shipped', 'completed', 'cancelled'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                style={styles.tab}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                </Text>
                <View style={[styles.tabBottomLine, activeTab === tab && styles.activeTabBottomLine]} />
              </TouchableOpacity>
            ))}
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
  customerName: {
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#11AB2F',
  },
  shipButton: {
    backgroundColor: '#11AB2F',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
});

export default SellerOrder;