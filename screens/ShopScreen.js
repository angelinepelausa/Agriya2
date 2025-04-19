import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { height } = Dimensions.get('window');

const ShopScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('Loading...');
  const [userUid, setUserUid] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        setUserUid(user.uid);
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setUsername(userData.username || 'No username');
            setProfileImageUrl(userData.profileImageUrl || null);
          } else {
            setUsername('User data not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUsername('Error fetching username');
        } finally {
          setLoading(false);
        }
      } else {
        setUsername('Not logged in');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewShop = () => {
    navigation.navigate('ShopDetails');
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleStatusPress = (status) => {
    navigation.navigate('SellerOrders', { 
      initialTab: status.toLowerCase()
    });
  };

  const renderProfileImage = () => {
    if (loading) {
      return (
        <View style={styles.profileImage}>
          <ActivityIndicator size="small" color="#11AB2F" />
        </View>
      );
    }
    
    if (profileImageUrl) {
      return (
        <Image
          source={{ uri: profileImageUrl }}
          style={styles.profileImage}
          resizeMode="cover"
        />
      );
    }
    
    return (
      <Image
        source={require('../assets/Profile_picture.png')}
        style={styles.profileImage}
        resizeMode="cover"
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>My Shop</Text>
      </View>

      <View style={styles.centeredContainers}>
        <View style={styles.shopSection}>
          {renderProfileImage()}
          <View style={styles.textButtonContainer}>
            <Text style={styles.usernameText}>{username}</Text>
          </View>
        </View>

        <View style={styles.orderSection}>
          <Text style={styles.sectionText}>Order Status</Text>
          <View style={styles.orderBoxesContainer}>
            <TouchableOpacity
              style={styles.orderBox}
              onPress={() => handleStatusPress('upcoming')}
            >
              <Text style={styles.orderBoxText}>Upcoming</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.orderBox}
              onPress={() => handleStatusPress('to_ship')}
            >
              <Text style={styles.orderBoxText}>To Ship</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.orderBox}
              onPress={() => handleStatusPress('shipped')}
            >
              <Text style={styles.orderBoxText}>Shipped</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.productsSection}>
          <Text style={styles.sectionText}>My Products</Text>

          <View style={styles.productGrid}>
            <TouchableOpacity style={styles.productItem}>
              <Image source={require('../assets/FruitsandVegetables.png')} style={styles.productImage} />
              <Text style={styles.productLabel}>Fruits & Vegetables</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.productItem}>
              <Image source={require('../assets/Dairy.png')} style={styles.productImage} />
              <Text style={styles.productLabel}>Dairy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productGrid}>
            <TouchableOpacity style={styles.productItem}>
              <Image source={require('../assets/Grains.png')} style={styles.productImage} />
              <Text style={styles.productLabel}>Grains</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.productItem}>
              <Image source={require('../assets/MeatandPoultry.png')} style={styles.productImage} />
              <Text style={styles.productLabel}>Meat & Poultry</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productGrid}>
            <TouchableOpacity
              style={[styles.productItem, styles.fullWidthItem]}
              onPress={handleAddProduct}
            >
              <View style={styles.addProductButton}>
                <Text style={styles.addProductButtonText}>Add Product</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeScreen')}>
          <Image source={require('../assets/Home.png')} style={styles.navImage} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MarketplaceScreen')}>
          <Image source={require('../assets/Marketplace.png')} style={styles.navImage} />
          <Text style={styles.navText}>Marketplace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/Notifications.png')} style={styles.navImage} />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/ProfileGreen.png')} style={styles.navImage} />
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
  centeredContainers: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
  },
  shopSection: {
    width: 337,
    height: 120,
    backgroundColor: '#F6FAF9',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#11AB2F',
    marginRight: 15,
    marginLeft: 20,
  },
  textButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  usernameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D5C5C',
    marginBottom: 10,
  },
  orderSection: {
    width: 337,
    height: 170,
    backgroundColor: '#F6FAF9',
    borderRadius: 10,
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  orderBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
    alignItems: 'center',
  },
  orderBox: {
    backgroundColor: 'rgb(240, 243, 242)',
    borderRadius: 6,
    width: '30%',
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderBoxText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5D5C5C',
  },
  productsSection: {
    width: 337,
    backgroundColor: '#F6FAF9',
    borderRadius: 10,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D5C5C',
  },
  productGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
  productItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '48%',
  },
  fullWidthItem: {
    width: '100%',
  },
  productImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  productLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5D5C5C',
    marginTop: 3,
    textAlign: 'center',
  },
  addProductButton: {
    backgroundColor: '#11AB2F',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  addProductButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#F6FAF9',
  },
  navItem: {
    alignItems: 'center',
  },
  navImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  navText: {
    fontSize: 10,
    color: '#5D5C5C',
  },
});

export default ShopScreen;