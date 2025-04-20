import React from 'react';
import { View, StyleSheet, Dimensions, Image, TextInput, FlatList, Text, ScrollView, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

const stores = [
  { id: '1', image: require('../assets/Dairy.png') },
  { id: '2', image: require('../assets/Dairy.png') },
  { id: '3', image: require('../assets/Dairy.png') },
  { id: '4', image: require('../assets/Dairy.png') },
  { id: '5', image: require('../assets/Dairy.png') },
  { id: '6', image: require('../assets/Dairy.png') },
  { id: '7', image: require('../assets/Dairy.png') },
  { id: '8', image: require('../assets/Dairy.png') },
];

const featuredProducts = [
  { id: '1', image: require('../assets/Dairy.png'), productName: 'Product 1', shopName: 'Shop 1', price: '₱12.99' },
  { id: '2', image: require('../assets/Dairy.png'), productName: 'Product 2', shopName: 'Shop 2', price: '₱15.99' },
  { id: '3', image: require('../assets/Dairy.png'), productName: 'Product 3', shopName: 'Shop 3', price: '₱10.99' },
  { id: '4', image: require('../assets/Dairy.png'), productName: 'Product 4', shopName: 'Shop 4', price: '₱19.99' },
  { id: '5', image: require('../assets/Dairy.png'), productName: 'Product 5', shopName: 'Shop 5', price: '₱14.99' },
  { id: '6', image: require('../assets/Dairy.png'), productName: 'Product 6', shopName: 'Shop 6', price: '₱13.99' },
];

const exploreProducts = [
  { id: '1', image: require('../assets/Dairy.png'), productName: 'Explore Product 1', shopName: 'Shop 1', price: '₱22.99' },
  { id: '2', image: require('../assets/Dairy.png'), productName: 'Explore Product 2', shopName: 'Shop 2', price: '₱25.99' },
  { id: '3', image: require('../assets/Dairy.png'), productName: 'Explore Product 3', shopName: 'Shop 3', price: '₱28.99' },
  { id: '4', image: require('../assets/Dairy.png'), productName: 'Explore Product 4', shopName: 'Shop 4', price: '₱30.99' },
  { id: '5', image: require('../assets/Dairy.png'), productName: 'Explore Product 5', shopName: 'Shop 5', price: '₱23.99' },
  { id: '6', image: require('../assets/Dairy.png'), productName: 'Explore Product 6', shopName: 'Shop 6', price: '₱26.99' },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  const renderStore = ({ item }) => (
    <View style={styles.storeItem}>
      <Image source={item.image} style={styles.storeImage} resizeMode="contain" />
    </View>
  );

  const renderFeaturedProduct = ({ item }) => (
    <View style={styles.featuredItem}>
      <Image source={item.image} style={styles.featuredImage} resizeMode="cover" />
      <View style={styles.textContainer}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.shopName}>{item.shopName}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </View>
  );

  const renderExploreProduct = ({ item }) => (
    <View style={styles.exploreItem}>
      <Image source={item.image} style={styles.exploreImage} resizeMode="cover" />
      <View style={styles.textContainer}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.shopName}>{item.shopName}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </View>
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
        <View style={styles.storeContainer}>
          <Text style={styles.popularStoreText}>Popular Stores</Text>
          <FlatList
            data={stores}
            renderItem={renderStore}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.featuredContainer}>
          <Text style={styles.featuredText}>Featured Products</Text>
          <FlatList
            data={featuredProducts}
            renderItem={renderFeaturedProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.exploreContainer}>
          <Text style={styles.exploreText}>Explore Products</Text>
          <FlatList
            data={exploreProducts}
            renderItem={renderExploreProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
          />
        </View>
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

        <TouchableOpacity style={styles.navItem}>
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
  storeContainer: {
    paddingHorizontal: 22,
    marginTop: 20,
  },
  popularStoreText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B1A12',
    marginBottom: 10,
  },
  storeItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  storeImage: {
    width: 75,
    height: 75,
  },
  featuredContainer: {
    paddingHorizontal: 22,
    marginTop: 20,
  },
  featuredText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B1A12',
    marginBottom: 10,
  },
  featuredItem: {
    backgroundColor: '#FFFFFF',
    width: 105,
    height: 134,
    marginRight: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  featuredImage: {
    width: '100%',
    height: '60%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  textContainer: {
    paddingLeft: 10,
    width: '100%',
    height: '40%',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  shopName: {
    fontSize: 10,
    color: '#888',
    marginBottom: 3,
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#11AB2F',
  },
  exploreContainer: {
    paddingHorizontal: 22,
    marginTop: 20,
  },
  exploreText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B1A12',
    marginBottom: 10,
  },
  exploreItem: {
    backgroundColor: '#FFFFFF',
    width: width * 0.42,
    height: 180,
    marginRight: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  exploreImage: {
    width: '100%',
    height: '60%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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