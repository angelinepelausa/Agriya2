import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { height } = Dimensions.get('window');

const ShopScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('Loading...');
  const [userUid, setUserUid] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        setUserUid(user.uid);
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setUsername(userData.username || 'No username');
          } else {
            setUsername('User data not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUsername('Error fetching username');
        }
      } else {
        setUsername('Not logged in');
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
          <Image
            source={require('../assets/Profile_picture.png')}
            style={styles.profileImage}
          />
          <View style={styles.textButtonContainer}>
            <Text style={styles.usernameText}>{username}</Text>
            <TouchableOpacity style={styles.viewShopButton} onPress={handleViewShop}>
              <Text style={styles.viewShopText}>View Shop</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.orderSection}>
          <Text style={styles.sectionText}>Order Status</Text>
          <View style={styles.orderBoxesContainer}>
            <View style={styles.orderBox}><Text style={styles.orderBoxText}>To Ship</Text></View>
            <View style={styles.orderBox}><Text style={styles.orderBoxText}>Cancelled</Text></View>
            <View style={styles.orderBox}><Text style={styles.orderBoxText}>Completed</Text></View>
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
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/Home.png')} style={styles.navImage} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/Marketplace.png')} style={styles.navImage} />
          <Text style={styles.navText}>Marketplace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/Orders.png')} style={styles.navImage} />
          <Text style={styles.navText}>Orders</Text>
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
  viewShopButton: {
    width: 70,
    height: 20,
    backgroundColor: '#11AB2F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  viewShopText: {
    fontSize: 8,
    fontWeight: '600',
    color: 'white',
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
    width: '40%',
    alignItems: 'center',
  },
  addProductButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 74,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navImage: {
    width: 25,
    height: 25,
  },
  navText: {
    fontSize: 10,
    color: '#5D5C5C',
    marginTop: 5,
    fontWeight: '600',
  },
});

export default ShopScreen;