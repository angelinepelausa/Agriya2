import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, TextInput, FlatList, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const { height, width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [popularStores, setPopularStores] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [exploreProducts, setExploreProducts] = useState([]);
  const [loading, setLoading] = useState({
    stores: true,
    featuredProducts: true,
    exploreProducts: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersQuery = await firestore().collection('users').get();
        const users = usersQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
    
        const productsQuery = await firestore().collection('products').get();
        const sellerSales = {};
        const allProducts = [];
    
        productsQuery.forEach(doc => {
          const product = doc.data();
          allProducts.push({
            id: doc.id,
            ...product
          });
          
          if (product.username && product.sold) {
            if (!sellerSales[product.username]) {
              sellerSales[product.username] = 0;
            }
            sellerSales[product.username] += product.sold || 0;
          }
        });
    
        const storesWithSales = users.map(user => ({
          id: user.id,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
          totalSold: sellerSales[user.username] || 0
        }));
    
        const sortedStores = storesWithSales.sort((a, b) => b.totalSold - a.totalSold);
        setPopularStores(sortedStores.slice(0, 10));
        setLoading(prev => ({...prev, stores: false}));
    
        const sortedFeaturedProducts = allProducts.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        const featuredProductsData = sortedFeaturedProducts.slice(0, 10);
        setFeaturedProducts(featuredProductsData);
        setLoading(prev => ({...prev, featuredProducts: false}));
    
        const featuredProductIds = featuredProductsData.map(p => p.id);
        const nonFeaturedProducts = allProducts.filter(product => !featuredProductIds.includes(product.id));
        const shuffledProducts = [...nonFeaturedProducts].sort(() => 0.5 - Math.random());
        setExploreProducts(shuffledProducts.slice(0, 20));
        setLoading(prev => ({...prev, exploreProducts: false}));
    
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading({
          stores: false,
          featuredProducts: false,
          exploreProducts: false
        });
      }
    };

    fetchData();
  }, []);

  const renderStore = ({ item }) => (
    <TouchableOpacity 
      style={styles.storeItem}
      onPress={() => navigation.navigate('ShopScreen', { username: item.username })}
    >
      <Image 
        source={item.profileImageUrl ? { uri: item.profileImageUrl } : require('../assets/Profile_picture.png')} 
        style={styles.storeImage} 
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderFeaturedProduct = ({ item }) => (
    <TouchableOpacity
      style={[styles.featuredProductBox, { marginRight: 15 }]}
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
  );

  const renderExploreProduct = ({ item }) => (
    <TouchableOpacity
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle}>
        <View style={styles.headerContent}>
          <View style={styles.headerRow}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/Agriya_white.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.cartContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
                <Image source={require('../assets/Cart.png')} style={styles.cartIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading.stores ? (
          <ActivityIndicator size="large" color="#11AB2F" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Popular Stores</Text>
            <FlatList
              data={popularStores}
              renderItem={renderStore}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}

        {loading.featuredProducts ? (
          <ActivityIndicator size="large" color="#11AB2F" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <FlatList
              data={featuredProducts}
              renderItem={renderFeaturedProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}

        {loading.exploreProducts ? (
          <ActivityIndicator size="large" color="#11AB2F" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Explore Products</Text>
            <View style={styles.productsContainer}>
              {exploreProducts.map((item) => (
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
          </View>
        )}
      </ScrollView>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/HomeGreen.png')} style={styles.navImage} />
          <Text style={[styles.navText, { color: '#11AB2F' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MarketplaceScreen')}>
          <Image source={require('../assets/Marketplace.png')} style={styles.navImage} />
          <Text style={styles.navText}>Marketplace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NotificationScreen')}>
          <Image source={require('../assets/Notifications.png')} style={styles.navImage} />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProfileScreen')}>
          <Image source={require('../assets/Profile.png')} style={styles.navImage} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    height: height * 0.2,
    backgroundColor: '#11AB2F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerContent: {
    alignItems: 'center',
    width: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30,
    marginLeft: 40,
  },
  cartContainer: {
    alignItems: 'flex-end',
  },
  cartIcon: {
    width: 25,
    height: 25,
    marginTop: 30,
    marginRight: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  searchBar: {
    width: '90%',
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 70,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingIndicator: {
    marginTop: 50,
    marginBottom: 50,
  },
  sectionContainer: {
    paddingHorizontal: 22,
    marginTop: 20,
  },
  listContent: {
    paddingRight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B1A12',
    marginBottom: 15,
  },
  storeItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  storeImage: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  featuredProductBox: {
    width: 165,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
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

export default HomeScreen;