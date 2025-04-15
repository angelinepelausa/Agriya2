import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Alert, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const ProfileScreen = () => {
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

  const handleImageAdd = () => {
    Alert.alert('Add Image', 'This will open image picker (to be implemented)');
  };

  const handleStartSelling = () => {
    navigation.navigate('ShopScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle} />

      <TouchableOpacity style={styles.button} onPress={handleStartSelling}>
        <View style={styles.buttonContent}>
          <Image
            source={require('../assets/StartSelling.png')}
            style={styles.buttonImage}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>Start Selling</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.centeredContainers}>
        <View style={styles.userContainer}>
          <TouchableOpacity style={styles.iconWrapper} onPress={handleImageAdd}>
            <Image
              source={require('../assets/Profile_picture.png')}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <Text style={styles.usernameText}>{username}</Text>
        </View>

        <View style={styles.purchasesContainer}>
          <Text style={styles.sectionText}>My Purchases</Text>

          <View style={styles.imagesRow}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/Pay.png')}
                style={styles.purchaseImage}
              />
              <Text style={styles.imageLabel}>To pay</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/Ship.png')}
                style={styles.purchaseImage}
              />
              <Text style={styles.imageLabel}>To ship</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/Receive.png')}
                style={styles.purchaseImage}
              />
              <Text style={styles.imageLabel}>To receive</Text>
            </View>
          </View>
        </View>

        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionText}>Other Activities</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.activityButton}>
              <Text style={styles.activityButtonText}>Recently Viewed</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityButton}>
              <Text style={styles.activityButtonText}>Buy Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../assets/Home.png')}
            style={styles.navImage}
          />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../assets/Marketplace.png')}
            style={styles.navImage}
          />
          <Text style={styles.navText}>Marketplace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../assets/Orders.png')}
            style={styles.navImage}
          />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../assets/ProfileGreen.png')}
            style={styles.navImage}
          />
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
    height: height * 0.15,
    backgroundColor: '#11AB2F',
  },
  button: {
    position: 'absolute',
    top: height * 0.12,
    backgroundColor: '#F6FAF9',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D5C5C',
  },
  buttonImage: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  centeredContainers: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingTop: 35,
    paddingBottom: 20,
  },
  userContainer: {
    width: 337,
    height: 160,
    backgroundColor: '#F6FAF9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    marginBottom: 15,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D5C5C',
  },
  purchasesContainer: {
    width: 337,
    height: 160,
    backgroundColor: '#F6FAF9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  activitiesContainer: {
    width: 337,
    height: 200,
    backgroundColor: '#F6FAF9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  sectionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D5C5C',
    textAlign: 'left',
    marginLeft: 40,
    marginBottom: 10,
    width: '100%',
  },
  imagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseImage: {
    width: 35,
    height: 35,
    marginBottom: 5,
  },
  imageLabel: {
    fontSize: 12,
    color: '#5D5C5C',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  activityButton: {
    width: '80%',
    paddingVertical: 13,
    backgroundColor: 'transparent',
    borderColor: '#B0B0B0',
    borderWidth: 0.5,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 0,
  },
  activityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D5C5C',
    marginLeft: 10,
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

export default ProfileScreen;