import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, TextInput, FlatList, Text, ScrollView, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const { height, width } = Dimensions.get('window');

const SellerShop = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { username } = route.params;
  
  const [sellerInfo, setSellerInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState({
    seller: true,
    products: true
  });

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const userQuery = await firestore()
          .collection('users')
          .where('username', '==', username)
          .get();
        
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          setSellerInfo({
            id: userDoc.id,
            ...userDoc.data()
          });
        }
        setLoading(prev => ({...prev, seller: false}));
      } catch (error) {
        console.error('Error fetching seller data:', error);
        setLoading(prev => ({...prev, seller: false}));
      }
    };

    const fetchProducts = async () => {
      try {
        const productsQuery = await firestore()
          .collection('products')
          .where('username', '==', username)
          .get();
        
        const productsData = productsQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsData);
        setFilteredProducts(productsData);
        setLoading(prev => ({...prev, products: false}));
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(prev => ({...prev, products: false}));
      }
    };

    fetchSellerData();
    fetchProducts();
  }, [username]);

  const handleSearch = () => {
    Keyboard.dismiss();
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const renderProduct = ({ item }) => (
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

  if (loading.seller || loading.products) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#11AB2F" />
      </View>
    );
  }

  if (!sellerInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Seller not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.shopTitle}>{username}'s Shop</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sellerInfoContainer}>
          <Image 
            source={sellerInfo.profileImageUrl ? { uri: sellerInfo.profileImageUrl } : require('../assets/Profile_picture.png')} 
            style={styles.profileImage} 
            resizeMode="cover"
          />
          <Text style={styles.shopNameText}>{username}</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search products in this shop"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch} 
            returnKeyType="search" 
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No products match your search' : 'This shop has no products yet'}
            </Text>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(240, 243, 242)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(240, 243, 242)',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#555',
  },
  topRectangle: {
    width: '100%',
    height: height * 0.12,
    backgroundColor: '#11AB2F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    flexDirection: 'row',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 40,
  },
  backArrow: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  shopTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sellerInfoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#11AB2F',
  },
  shopNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#11AB2F',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  productsContainer: {
    paddingHorizontal: 10,
  },
  productBox: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: '1%',
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
  columnWrapper: {
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default SellerShop;