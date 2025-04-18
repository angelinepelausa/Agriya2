import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, ActivityIndicator, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { height } = Dimensions.get('window');

const CheckoutScreen = ({ navigation, route }) => {
    const [userData, setUserData] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const { selectedItems, username } = route.params || {};
  
    useEffect(() => {
      const user = auth().currentUser;
      if (!user) {
        setLoading(false);
        navigation.goBack();
        return;
      }
  
      if (selectedItems && selectedItems.length > 0) {
        setCartItems(selectedItems);
        setLoading(false);
      }
  
      const userUnsubscribe = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(
          (doc) => {
            if (doc.exists) {
              setUserData(doc.data());
            }
          },
          (error) => {
            console.error("Error fetching user data:", error);
            setLoading(false);
          }
        );
  
      return () => userUnsubscribe();
    }, [selectedItems]);

    const calculateSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const calculateTotal = () => calculateSubtotal() + 80;

    const handlePlaceOrder = async () => {
      try {
        const user = auth().currentUser;
        if (!user) {
          Alert.alert('Error', 'You must be logged in to place an order');
          return;
        }
    
        if (cartItems.length === 0) {
          Alert.alert('Error', 'No items selected for checkout');
          return;
        }
    
        const orderData = {
          userId: user.uid,
          items: cartItems,
          subtotal: calculateSubtotal(),
          shipping: 80,
          total: calculateTotal(),
          status: 'to_ship',
          createdAt: firestore.FieldValue.serverTimestamp(),
          customerInfo: {
            name: userData?.fullName,
            phone: userData?.phone,
            address: userData?.address
          }
        };
    
        const orderRef = await firestore().collection('orders').add(orderData);
    
        if (username) {
          const cartRef = firestore().collection('cart').doc(username);
          const cartDoc = await cartRef.get();
          
          if (cartDoc.exists) {
            const remainingItems = cartDoc.data().products.filter(item => 
              !cartItems.some(selectedItem => selectedItem.productId === item.productId)
            );
            
            if (remainingItems.length > 0) {
              await cartRef.update({ products: remainingItems });
            } else {
              await cartRef.delete();
            }
          }
        }
    
        navigation.navigate('PurchasesScreen', { 
          status: 'to_ship',
          newOrder: {
            id: orderRef.id,
            ...orderData
          }
        });
      } catch (error) {
        console.error("Error placing order:", error);
        Alert.alert('Error', 'Failed to place order. Please try again.');
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.topRectangle}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>&lt;</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Checkout</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Full Name:</Text>
              <Text style={styles.value}>{userData?.fullName || 'Not provided'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone Number:</Text>
              <Text style={styles.value}>{userData?.phone || 'Not provided'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{userData?.address || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Order Items ({cartItems.length})</Text>
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <View key={`${item.productId}_${index}`} style={styles.itemContainer}>
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemPrice}>₱{item.price.toFixed(2)}</Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemTotal}>₱{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>No items selected for checkout</Text>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>
                Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}):
              </Text>
              <Text style={styles.paymentValue}>₱{calculateSubtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Shipping Fee:</Text>
              <Text style={styles.paymentValue}>₱80.00</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={[styles.paymentLabel, styles.totalLabel]}>Total Payment:</Text>
              <Text style={[styles.paymentValue, styles.totalValue]}>₱{calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.placeOrderButton, cartItems.length === 0 && styles.disabledButton]} 
            onPress={handlePlaceOrder}
            disabled={cartItems.length === 0}
          >
            <Text style={styles.placeOrderText}>Place Order (₱{calculateTotal().toFixed(2)})</Text>
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
  },
  backArrow: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
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
  scrollContainer: {
    paddingBottom: 100,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginVertical: 2, 
    marginHorizontal: 5, 
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#11AB2F',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    width: 100,
    color: '#5D5C5C',
  },
  value: {
    fontSize: 14,
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 12,
    color: '#11AB2F',
    marginTop: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#5D5C5C',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noItemsText: {
    textAlign: 'center',
    color: '#5D5C5C',
    fontStyle: 'italic',
  },
  paymentMethod: {
    borderRadius: 5,
  },
  paymentText: {
    fontSize: 14,
    color: '#5D5C5C',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#5D5C5C',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#5D5C5C',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#11AB2F',
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  placeOrderButton: {
    backgroundColor: '#11AB2F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  placeOrderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CheckoutScreen;