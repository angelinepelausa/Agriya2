import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const BuyAgain = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser;
        if (!user) {
          Alert.alert('Error', 'User not authenticated');
          return;
        }

        const userDoc = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();

        if (userDoc.exists) {
          setCurrentUsername(userDoc.data().username || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!currentUsername) return;

    const fetchCompletedProducts = async () => {
      try {
        setLoading(true);
        setProducts([]);

        const ordersDoc = await firestore()
          .collection('orders')
          .doc(currentUsername)
          .get();

        if (!ordersDoc.exists) {
          console.log('No orders found for user');
          setLoading(false);
          return;
        }

        const ordersData = ordersDoc.data();
        if (!ordersData?.orders || !Array.isArray(ordersData.orders)) {
          console.log('Invalid orders data structure');
          setLoading(false);
          return;
        }

        const completedOrders = ordersData.orders.filter(order => 
          order?.status === 'completed' && 
          Array.isArray(order?.items)
        );

        if (completedOrders.length === 0) {
          console.log('No completed orders found');
          setLoading(false);
          return;
        }

        const productIds = [];
        completedOrders.forEach(order => {
          order.items.forEach(item => {
            if (item?.productId && !productIds.includes(item.productId)) {
              productIds.push(item.productId);
            }
          });
        });

        if (productIds.length === 0) {
          console.log('No valid product IDs found');
          setLoading(false);
          return;
        }

        const productsData = [];
        
        const batchSize = 10;
        for (let i = 0; i < productIds.length; i += batchSize) {
          const batch = productIds.slice(i, i + batchSize);
          
          const querySnapshot = await firestore()
            .collection('products')
            .where('productId', 'in', batch)
            .get();

          querySnapshot.forEach(doc => {
            if (doc.exists) {
              productsData.push({
                id: doc.id, 
                ...doc.data() 
              });
            }
          });
        }

        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        Alert.alert('Error', 'Failed to load previously purchased products');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedProducts();
  }, [currentUsername]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topRectangle}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Buy Again</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#11AB2F" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Buy Again</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {products.length > 0 ? (
          <View style={styles.productsContainer}>
            {products.map((item) => (
              <TouchableOpacity
                key={item.productId} 
                style={styles.productBox}
                onPress={() => navigation.navigate('ViewProduct', { 
                  product: item 
                })}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
                <View style={styles.textContainer}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <Text style={styles.shopName}>{item.username}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₱{Number(item.price).toFixed(2)} / {item.unit}</Text>
                    <Text style={styles.soldText}>{item.sold || 0} sold</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No previously purchased products</Text>
          </View>
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 15,
  },
  productBox: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  textContainer: {
    alignItems: 'flex-start',
    padding: 10,
  },
  shopName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  price: {
    fontSize: 13,
    color: '#11AB2F',
    fontWeight: 'bold',
  },
  soldText: {
    fontSize: 11,
    color: '#888',
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default BuyAgain;