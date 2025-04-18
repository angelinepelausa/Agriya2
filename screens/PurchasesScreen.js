import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { height } = Dimensions.get('window');

const PurchasesScreen = ({ route, navigation }) => {
    const [activeTab, setActiveTab] = useState('to_pay');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (route.params?.status) {
        setActiveTab(route.params.status);
      }
  
      if (route.params?.newOrder) {
        setOrders([route.params.newOrder]);
        setLoading(false);
        return;
      }
  
      const user = auth().currentUser;
      if (!user) {
        setLoading(false);
        navigation.goBack();
        return;
      }
  
      const unsubscribe = firestore()
        .collection('orders')
        .where('userId', '==', user.uid)
        .where('status', '==', 'to_pay')
        .orderBy('createdAt', 'desc')
        .onSnapshot(querySnapshot => {
          const ordersData = [];
          querySnapshot.forEach(doc => {
            ordersData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          setOrders(ordersData);
          setLoading(false);
        }, error => {
          console.error("Error fetching orders:", error);
          setLoading(false);
        });
  
      return () => unsubscribe();
    }, [route.params?.status, route.params?.newOrder]);
  
    const renderContent = () => {
      if (loading) {
        return <ActivityIndicator size="large" color="#11AB2F" style={styles.loadingIndicator} />;
      }
  
      if (orders.length === 0) {
        return <EmptyState message="No orders yet" />;
      }
  
      return (
        <View style={styles.ordersContainer}>
          {orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <Text style={styles.shopName}>Your Order</Text>
              
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
    color: 'white',
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: 'white',
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
    backgroundColor: 'white',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 15,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  ordersContainer: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
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
  },
  orderSummary: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
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