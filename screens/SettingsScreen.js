import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { height } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userUid, setUserUid] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (user) {
        setUserUid(user.uid);
        const unsubscribeFirestore = firestore()
          .collection('users')
          .doc(user.uid)
          .onSnapshot(doc => {
            if (doc.exists) {
              const userData = doc.data();
              setFullName(userData.fullName || '');
              setUsername(userData.username || '');
              setPassword(userData.password || '');
              setAddress(userData.address || '');
              setPhone(userData.phone || '');
            }
            setLoading(false);
          });

        return () => unsubscribeFirestore();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSave = async () => {
    if (!fullName || !username || !password) {
      Alert.alert('Error', 'Full name, username and password are required');
      return;
    }
  
    setUpdating(true);
    try {
      await firestore().collection('users').doc(userUid).update({
        fullName,
        username,
        password,
        address,
        phone
      });
  
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ProfileScreen'),
          },
        ],
        { cancelable: false }
      );
  
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };  

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#11AB2F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your address"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={updating}
        >
          <Text style={styles.buttonText}>
            {updating ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={updating}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(240, 243, 242)',
    justifyContent: 'space-between',
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
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D5C5C',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgb(240, 243, 242)',
  },
  saveButton: {
    backgroundColor: '#11AB2F',
    paddingVertical: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#D11A2A',
    paddingVertical: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;