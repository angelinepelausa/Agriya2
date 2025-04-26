import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const RecentlyViewed = () => {
  const navigation = useNavigation();
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            setCurrentUsername(userDoc.data().username || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!currentUsername) return;

    const fetchRecentlyViewed = async () => {
      try {
        const userQuery = await firestore()
          .collection('users')
          .where('username', '==', currentUsername)
          .limit(1)
          .get();

        if (!userQuery.empty) {
          const userData = userQuery.docs[0].data();
          const viewedProductIds = userData.recentlyViewed || [];

          const validProductIds = viewedProductIds
            .filter(id => typeof id === 'string' && id.length > 0)
            .slice(0, 10);

          if (validProductIds.length === 0) {
            setRecentProducts([]);
            setLoading(false);
            return;
          }

          const productsSnapshot = await firestore()
            .collection('products')
            .where(firestore.FieldPath.documentId(), 'in', validProductIds)
            .get();

          const products = productsSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            productId: doc.id
          }));

          const sortedProducts = validProductIds
            .map(id => products.find(p => p.id === id))
            .filter(p => p);

          setRecentProducts(sortedProducts);
        }
      } catch (error) {
        console.error('Error fetching recently viewed products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [currentUsername]);

  const handleBackPress = () => navigation.goBack();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topRectangle}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Recently Viewed</Text>
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
        <Text style={styles.pageTitle}>Recently Viewed</Text>
      </View>

      {recentProducts.length > 0 ? (
        <View style={styles.productsContainer}>
          {recentProducts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productBox}
              onPress={() => navigation.navigate('ViewProduct', { 
                product: {
                  ...item,
                  productId: item.id
                }
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
          <Text style={styles.emptyText}>No recently viewed products</Text>
        </View>
      )}
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
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shopName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 13,
    color: '#11AB2F',
    fontWeight: 'bold',
  },
  soldText: {
    fontSize: 11,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default RecentlyViewed;