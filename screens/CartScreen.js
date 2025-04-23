import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { height } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [currentUsername, setCurrentUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);
  const [previousQuantity, setPreviousQuantity] = useState(1);

  useEffect(() => {
    const fetchUsername = async () => {
      const user = auth().currentUser;
      if (user) {
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            setCurrentUsername(userDoc.data().username);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    if (currentUsername) {
      const subscriber = firestore()
        .collection('cart')
        .doc(currentUsername)
        .onSnapshot(documentSnapshot => {
          if (documentSnapshot.exists) {
            const cartData = documentSnapshot.data();
            const newCartItems = cartData.products || [];
            setCartItems(newCartItems);
          } else {
            setCartItems([]);
          }
          setLoading(false);
        }, error => {
          console.error("Error fetching cart items:", error);
          setLoading(false);
        });

      return () => subscriber();
    }
  }, [currentUsername]);

  const toggleItemSelection = async (productId) => {
    try {
      const cartRef = firestore().collection('cart').doc(currentUsername);
      const cartDoc = await cartRef.get();

      if (cartDoc.exists) {
        const cartData = cartDoc.data();
        const updatedProducts = cartData.products.map(item => {
          if (item.productId === productId) {
            return { ...item, selected: !item.selected };
          }
          return item;
        });

        await cartRef.update({ products: updatedProducts });
      }
    } catch (error) {
      console.error("Error toggling item selection:", error);
      Alert.alert('Error', 'Failed to update selection');
    }
  };

  const handleQuantityBlur = (productId) => {
    if (editingProductId === productId) {
      const item = cartItems.find(i => i.productId === productId);
      if (item && item.quantity === '') {
        Alert.alert(
          'Remove Item',
          'Do you want to remove this product?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                const updatedItems = cartItems.map(i => {
                  if (i.productId === productId) {
                    return { ...i, quantity: previousQuantity };
                  }
                  return i;
                });
                setCartItems(updatedItems);
                updateCartItemQuantity(productId, previousQuantity);
              }
            },
            {
              text: 'Remove',
              onPress: () => removeFromCart(productId),
            },
          ],
          { cancelable: true }
        );
      }
      setEditingProductId(null);
    }
  };

  const handleQuantityChange = (productId, text) => {
    if (text === '') {
      const item = cartItems.find(i => i.productId === productId);
      if (item) {
        setPreviousQuantity(item.quantity);
        setEditingProductId(productId);
  
        const updatedItems = cartItems.map(i => {
          if (i.productId === productId) {
            return { ...i, quantity: '' };
          }
          return i;
        });
  
        setCartItems(updatedItems);
      }
      return;
    }
  
    const newQuantity = parseInt(text);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      updateCartItemQuantity(productId, newQuantity);
    }
  };  

  const incrementQuantity = (productId, currentQuantity) => {
    updateCartItemQuantity(productId, currentQuantity + 1);
  };

  const decrementQuantity = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateCartItemQuantity(productId, currentQuantity - 1);
    } else {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this product?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            onPress: () => removeFromCart(productId),
          },
        ],
        { cancelable: true }
      );
    }
  };

  const updateCartItemQuantity = async (productId, newQuantity) => {
    try {
      const cartRef = firestore().collection('cart').doc(currentUsername);
      const cartDoc = await cartRef.get();

      if (cartDoc.exists) {
        const cartData = cartDoc.data();
        const updatedProducts = cartData.products.map(item => {
          if (item.productId === productId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        }).filter(item => item.quantity > 0);

        await cartRef.update({ products: updatedProducts });
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const cartRef = firestore().collection('cart').doc(currentUsername);
      const cartDoc = await cartRef.get();

      if (cartDoc.exists) {
        const cartData = cartDoc.data();
        const updatedProducts = cartData.products.filter(item => item.productId !== productId);

        if (updatedProducts.length > 0) {
          await cartRef.update({ products: updatedProducts });
        } else {
          await cartRef.delete();
        }
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.selected && typeof item.quantity === 'number') {
        return total + (item.price * item.quantity);
      }
      return total;
    }, 0).toFixed(2);
  };

  const hasSelectedItems = () => {
    return cartItems.some(item => item.selected);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Cart</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
          </View>
        ) : (
          cartItems.map((item, index) => (
            <View key={index} style={styles.cartItemContainer}>
              <View style={styles.sellerUsernameContainer}>
                <Text style={styles.sellerUsername}>{item.sellerUsername}</Text>
              </View>

              <View style={styles.productRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleItemSelection(item.productId)}
                >
                  <Text style={styles.checkboxText}>
                    {item.selected ? '☑' : '☐'}
                  </Text>
                </TouchableOpacity>

                <Image source={{ uri: item.imageUrl }} style={styles.cartItemImage} />
                <View style={styles.cartItemDetails}>
                  <Text style={styles.cartItemName}>{item.productName}</Text>
                  <Text style={styles.cartItemPrice}>₱{Number(item.price).toFixed(2)} / {item.unit}</Text>
                  
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.qtyButton} 
                      onPress={() => decrementQuantity(item.productId, typeof item.quantity === 'number' ? item.quantity : previousQuantity)}
                    >
                      <Text style={styles.qtyText}>-</Text>
                    </TouchableOpacity>

                    <TextInput
                      style={styles.qtyInput}
                      value={item.quantity.toString()}
                      onChangeText={(text) => handleQuantityChange(item.productId, text)}
                      onBlur={() => handleQuantityBlur(item.productId)}
                      keyboardType="number-pad"
                      maxLength={3}
                    />

                    <TouchableOpacity 
                      style={styles.qtyButton} 
                      onPress={() => incrementQuantity(item.productId, typeof item.quantity === 'number' ? item.quantity : previousQuantity)}
                    >
                      <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ₱{calculateTotal()}</Text>
        <TouchableOpacity 
          style={[
            styles.checkoutButton, 
            (!hasSelectedItems() || cartItems.length === 0) && styles.disabledButton
          ]}
          disabled={!hasSelectedItems() || cartItems.length === 0}
          onPress={() => {
            if (hasSelectedItems()) {
              const selectedItems = cartItems.filter(item => item.selected);
              navigation.navigate('CheckoutScreen', { 
                selectedItems: selectedItems,
                username: currentUsername
              });
            } else {
              Alert.alert('No Item Selected', 'Please select at least one item to proceed.');
            }
          }}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
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
  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyCartText: {
    fontSize: 18,
    textAlign: 'center',
  },
  cartItemContainer: {
    backgroundColor: 'white',
    marginBottom: 1,
    padding: 15,
    borderRadius: 2,
    elevation: 1,
  },
  sellerUsernameContainer: {
    marginBottom: 10,
  },
  sellerUsername: {
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 35,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 15,
  },
  checkboxText: {
    fontSize: 20,
  },
  cartItemImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 15,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 16,
    color: '#11AB2F',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 35,
    height: 35,
    borderRadius: 5,
    backgroundColor: '#11AB2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  qtyInput: {
    width: 40,
    height: 40,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
    fontSize: 14,
  },
  totalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#11AB2F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CartScreen;