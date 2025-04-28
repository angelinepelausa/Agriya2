import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ViewProduct = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [sameShopProducts, setSameShopProducts] = useState([]);
  const [currentUsername, setCurrentUsername] = useState('');
  const [userProfileComplete, setUserProfileComplete] = useState(false);
  const [shopImageUrl, setShopImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const productId = product.productId || product.id;

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data();
            setCurrentUsername(data.username || '');
            const isProfileComplete = data.fullName && data.username && data.password && data.address && data.phone;
            setUserProfileComplete(isProfileComplete);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    const fetchShopImage = async () => {
      try {
        const sellerDoc = await firestore()
          .collection('users')
          .where('username', '==', product.username)
          .get();
        
        if (!sellerDoc.empty) {
          const sellerData = sellerDoc.docs[0].data();
          setShopImageUrl(sellerData.profileImageUrl || null);
        }
      } catch (error) {
        console.error('Error fetching shop image:', error);
      }
    };

    fetchUserData();
    fetchShopImage();
  }, [product.username]);

  useEffect(() => {
    const fetchSameShopProducts = async () => {
      try {
        const productsSnapshot = await firestore()
          .collection('products')
          .where('username', '==', product.username)
          .get();

        const products = productsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          productId: doc.id, 
          unit: doc.data().unit || 'item' 
        }));
        
        const filteredProducts = products.filter(item => item.productName !== product.productName);
        setSameShopProducts(filteredProducts.slice(0, 6));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchSameShopProducts();
  }, [product.username, product.productName]);

  useEffect(() => {
    const trackProductView = async () => {
      if (!currentUsername || !productId) return;
      
      try {
        const userQuery = await firestore()
          .collection('users')
          .where('username', '==', currentUsername)
          .get();
  
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          const userData = userDoc.data();
          let recentlyViewed = userData.recentlyViewed || [];
          
          recentlyViewed = recentlyViewed.filter(id => id !== productId);
          recentlyViewed.unshift(productId);
          recentlyViewed = recentlyViewed.slice(0, 10);
          
          await firestore()
            .collection('users')
            .doc(userDoc.id)
            .update({
              recentlyViewed: recentlyViewed
            });
        }
      } catch (error) {
        console.error('Error tracking product view:', error);
      }
    };
  
    trackProductView();
  }, [currentUsername, productId]);

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    if (!userProfileComplete) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile in Settings before adding items to cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => navigation.navigate('SettingsScreen') }
        ],
        { cancelable: false }
      );
      return;
    }

    if (currentUsername === product.username) {
      Alert.alert(
        'Cannot Add Product',
        'You cannot add your own product to the cart.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
      return;
    }
  
    if (quantity > 0 && currentUsername) {
      try {
        const cartRef = firestore().collection('cart').doc(currentUsername);
        
        await firestore().runTransaction(async (transaction) => {
          const cartDoc = await transaction.get(cartRef);
          
          if (cartDoc.exists) {
            const cartData = cartDoc.data();
            let products = cartData.products || [];
            
            const existingProductIndex = products.findIndex(
              p => p.productId === product.productId
            );
            
            if (existingProductIndex !== -1) {
              products[existingProductIndex].quantity += quantity;
            } else {
              products.push({
                productName: product.productName,
                quantity,
                price: product.price,
                imageUrl: product.imageUrl,
                productId: product.productId,
                sellerUsername: product.username,
                unit: product.unit || 'item' 
              });
            }
            
            transaction.update(cartRef, { products });
          } else {
            transaction.set(cartRef, {
              products: [{
                productName: product.productName,
                quantity,
                price: product.price,
                imageUrl: product.imageUrl,
                productId: product.productId,
                sellerUsername: product.username,
                unit: product.unit || 'item' 
              }]
            });
          }
        });
        
        Alert.alert('Success', 'Added to cart successfully', [{ text: 'OK' }], { cancelable: false });
      } catch (error) {
        console.error('Error adding to cart: ', error);
        Alert.alert('Error', 'There was an error adding the product to the cart.', [{ text: 'OK' }]);
      }
    } else {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.', [{ text: 'OK' }]);
    }
  };

  const handleVisitShop = () => {
    const currentUser = auth().currentUser;
    const isCurrentUserShop = currentUser && currentUsername === product.username;
    
    if (isCurrentUserShop) {
      navigation.navigate('ViewShop');
    } else {
      navigation.navigate('SellerShop', { username: product.username });
    }
  };

  const handleQuantityChange = (text) => {
    const newQuantity = parseInt(text);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setQuantity(newQuantity);
    } else if (text === '') {
      setQuantity(0);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#11AB2F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageAndDetailsContainer}>
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.details}>
          <Text style={styles.price}>₱{Number(product.price).toFixed(2)} {product.unit ? `/ ${product.unit}` : ''}</Text>
            <Text style={styles.name}>{product.productName}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.shopInfo}>
            <View style={styles.shopRow}>
              <Image 
                source={shopImageUrl ? { uri: shopImageUrl } : require('../assets/Profile_picture.png')} 
                style={styles.shopImage} 
              />
              <View style={styles.shopDetails}>
                <Text style={styles.shopName}>{product.username}</Text>
                <View style={styles.visitShopButtonContainer}>
                <TouchableOpacity 
                  style={styles.visitShopButton}
                  onPress={handleVisitShop}
                >
                  <Text style={styles.visitShopButtonText}>
                    {currentUsername === product.username ? 'My Shop' : 'Visit Shop'}
                  </Text>
                </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sameShopSection}>
            <Text style={styles.sameShopText}>From the same shop</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SellerShop', { username: product.username })}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
          {sameShopProducts.length > 0 ? (
            sameShopProducts.map((shopProduct, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.push('ViewProduct', { product: shopProduct })}
                style={styles.shopProductWrapper}
              >
                <View style={styles.shopProductContainer}>
                  <Image source={{ uri: shopProduct.imageUrl }} style={styles.shopProductImage} />
                  <Text style={styles.shopProductName}>{shopProduct.productName}</Text>
                  <Text style={styles.shopProductPrice}>₱{Number(shopProduct.price).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noShopProducts}>No products from this shop available.</Text>
          )}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description || 'No description available.'}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.cartRow}>
        <TouchableOpacity 
          style={[styles.addToCart, !userProfileComplete && styles.disabledButton]} 
          onPress={handleAddToCart} 
          disabled={quantity <= 0 || !userProfileComplete}
        >
          <Text
            style={[
              styles.addToCartText,
              !userProfileComplete ? styles.incompleteProfileText : styles.completeProfileText
            ]}
          >
            {!userProfileComplete ? 'Complete Profile to Add to Cart' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>

        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.qtyButton} onPress={decrement}>
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.qtyInput}
            value={quantity === 0 ? '' : quantity.toString()}
            onChangeText={handleQuantityChange}
            keyboardType="number-pad"
            maxLength={3}
          />

          <TouchableOpacity style={styles.qtyButton} onPress={increment}>
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f2',
    justifyContent: 'flex-end',
  },
  scrollContent: {
    paddingBottom: 100, 
  },
  imageAndDetailsContainer: {
    backgroundColor: 'white',
    marginBottom: 5,
  },
  sectionContainer: {
    marginBottom: 5,
    backgroundColor: '#fff', 
    padding: 10, 
    borderRadius: 5, 
    elevation: 1,
  },
  image: {
    width: '100%',
    height: 280,
  },
  details: {
    padding: 10,
  },
  price: {
    fontSize: 27,
    color: '#11AB2F',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  name: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1B1A12',
    marginBottom: 10,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  shopImage: {
    width: 60,
    height: 60,
    borderRadius: 999,
    marginRight: 10,
  },
  shopDetails: {
    flex: 1,
    flexDirection: 'column',
  },
  visitShopButtonContainer: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  visitShopButton: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#11AB2F',
    borderRadius: 5,
  },
  visitShopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sameShopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sameShopText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#11AB2F',
  },
  productList: {
    marginBottom: 5,
  },
  shopProductContainer: {
    marginRight: 15,
    width: 120,
    alignItems: 'flex-start',
  },
  shopProductWrapper: {
    backgroundColor: '#fafafa',
    borderWidth: 0.3,
    borderColor: '#c0c0c0',
    marginBottom: 5,
    borderRadius: 5,
    marginRight: 15,
    overflow: 'hidden',
    width: 120,
    alignItems: 'flex-start', 
    justifyContent: 'flex-start', 
  },
  shopProductImage: {
    width: '100%', 
    height: 120,    
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 5,
    resizeMode: 'cover', 
  },
  shopProductName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    paddingLeft: 10,
  },
  shopProductPrice: {
    fontSize: 14,
    color: '#11AB2F',
    marginBottom: 5,
    textAlign: 'left',
    paddingLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f3f2',
  },
  noShopProducts: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingVertical: 10,
  },
  descriptionSection: {
    marginBottom: 5,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1B1A12',
  },
  description: {
    fontSize: 16,
    color: '#333',
  },
  cartRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    zIndex: 10, 
  },
  addToCart: {
    backgroundColor: '#11AB2F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  incompleteProfileText: {
    fontSize: 12, 
  },
  completeProfileText: {
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#11AB2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 18,
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
    marginHorizontal: 10,
    fontSize: 16,
  },
});

export default ViewProduct;