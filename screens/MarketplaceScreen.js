import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, Text, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const { height } = Dimensions.get('window');

const MarketplaceScreen = () => {
  const [activeCategory, setActiveCategory] = useState('Fruits & Vegetables');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await firestore()
          .collection('products')
          .where('category', '==', activeCategory)
          .get();
  
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          productId: doc.id,
          ...doc.data()
        }));
  
        productList.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
      setLoading(false);
    };
  
    fetchProducts();
  }, [activeCategory]);

  const renderProducts = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#11AB2F" style={{ marginTop: 20 }} />;
    }

    if (products.length === 0) {
      return <Text style={styles.noProducts}>No products available.</Text>;
    }

    return (
      <View style={styles.productsContainer}>
        {products.map((item) => (
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
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle}>
        <View style={styles.headerContent}>
          <View style={styles.searchCartContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search"
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
              <Image source={require('../assets/Cart.png')} style={styles.cartIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <View style={styles.categoryContainer}>
            {[
              { key: 'Fruits & Vegetables', label: 'Fruits & Vegetables', image: require('../assets/FruitsandVegetables2.png') },
              { key: 'Meat & Poultry', label: 'Meat & Poultry', image: require('../assets/MeatandPoultry2.png') },
              { key: 'Dairy', label: 'Dairy', image: require('../assets/Dairy2.png') },
              { key: 'Grains', label: 'Grains', image: require('../assets/Grains2.png') },
            ].map(({ key, label, image }) => (
              <TouchableOpacity key={key} onPress={() => setActiveCategory(key)}>
                <View style={styles.categoryWrapper}>
                  <View style={styles.categoryBox}>
                    <Image source={image} style={styles.categoryImage} resizeMode="contain" />
                    <Text style={styles.categoryText}>{label}</Text>
                  </View>
                  {activeCategory === key && <View style={styles.triangle} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        <Text style={styles.exploreText}>
          {activeCategory.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim()}
        </Text>
        {renderProducts()}
      </ScrollView>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeScreen')}>
          <Image source={require('../assets/Home.png')} style={styles.navImage} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/MarketplaceGreen.png')} style={styles.navImage} />
          <Text style={[styles.navText, { color: '#11AB2F' }]}>Marketplace</Text>
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
    paddingBottom: 70,
  },
  topRectangle: {
    width: '100%',
    height: height * 0.25,
    backgroundColor: '#11AB2F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  headerContent: {
    alignItems: 'center',
    width: '90%',
  },
  searchCartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 14,
    marginRight: 10,
  },
  cartIcon: {
    width: 25,
    height: 25,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 10,
  },
  categoryWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBox: {
    width: 75,
    height: 92,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  categoryImage: {
    width: 35,
    height: 35,
    marginBottom: 5,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
  },
  categoryText: {
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 5,
    fontWeight: '500',
  },
  scrollArea: {
    paddingHorizontal: 22,
    marginTop: 20,
  },
  exploreText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1B1A12',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
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
    position: 'absolute',
    bottom: 0,
    height: 70,
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
  },
  navImage: {
    width: 24,
    height: 24,
  },
  navText: {
    fontSize: 10,
    color: '#888',
  },
});

export default MarketplaceScreen;