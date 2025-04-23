import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Alert, Image, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

const { height } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('Loading...');
  const [userUid, setUserUid] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

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
        }
      } else {
        setUsername('Not logged in');
      }
    });

    return () => unsubscribe();
  }, []);

  const uploadImageToCloudinary = async (uri) => {
    const data = new FormData();
    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    data.append('upload_preset', 'Agriya');
    data.append('cloud_name', 'drzhpbmus');

    const res = await fetch('https://api.cloudinary.com/v1_1/drzhpbmus/image/upload', {
      method: 'POST',
      body: data,
    });

    const json = await res.json();
    return json.secure_url;
  };

  const handleImageAdd = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        setUploading(true);
        const uri = result.assets[0].uri;
        
        const imageUrl = await uploadImageToCloudinary(uri);
        
        await firestore().collection('users').doc(userUid).update({
          profileImageUrl: imageUrl
        });
        
        setProfileImageUrl(imageUrl);
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', 'Failed to upload profile image');
    } finally {
      setUploading(false);
    }
  };

  const handleStartSelling = () => {
    navigation.navigate('ShopScreen');
  };

  const renderProfileImage = () => {
    if (uploading) {
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
      <View style={styles.topRectangle} />

      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
          <Image
            source={require('../assets/Cart.png')}
            style={styles.iconImage}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('SettingsScreen')}>
          <Image
            source={require('../assets/Settings.png')}
            style={styles.iconImage}
          />
        </TouchableOpacity>
      </View>

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
            {renderProfileImage()}
          </TouchableOpacity>
          <Text style={styles.usernameText}>{username}</Text>
        </View>

        <View style={styles.purchasesContainer}>
          <Text style={styles.sectionText}>My Purchases</Text>
          <View style={styles.imagesRow}>
            <TouchableOpacity 
              style={styles.imageContainer} 
              onPress={() => navigation.navigate('PurchasesScreen', { initialTab: 'to_pay' })}
            >
              <Image
                source={require('../assets/Pay.png')}
                style={styles.purchaseImage}
              />
              <Text style={styles.imageLabel}>To pay</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageContainer} 
              onPress={() => navigation.navigate('PurchasesScreen', { initialTab: 'to_ship' })}
            >
              <Image
                source={require('../assets/Ship.png')}
                style={styles.purchaseImage}
              />
              <Text style={styles.imageLabel}>To ship</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageContainer} 
              onPress={() => navigation.navigate('PurchasesScreen', { initialTab: 'to_receive' })}
            >
              <Image
                source={require('../assets/Receive.png')}
                style={styles.purchaseImage}
              />
              <Text style={styles.imageLabel}>To receive</Text>
            </TouchableOpacity>
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
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeScreen')}>
          <Image
            source={require('../assets/Home.png')}
            style={styles.navImage}
          />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MarketplaceScreen')}>
          <Image
            source={require('../assets/Marketplace.png')}
            style={styles.navImage}
          />
          <Text style={styles.navText}>Marketplace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NotificationScreen')}>
          <Image
            source={require('../assets/Notifications.png')}
            style={styles.navImage}
          />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../assets/ProfileGreen.png')}
            style={styles.navImage}
          />
          <Text style={[styles.navText, { color: '#11AB2F' }]}>Profile</Text>
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
  iconContainer: {
    position: 'absolute',
    top: height * 0.06,
    right: 20,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
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
    width: 80,
    height: 80,
    marginBottom: 15,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#11AB2F',
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

export default ProfileScreen;