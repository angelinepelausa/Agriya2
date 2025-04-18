import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, TextInput, StyleSheet, Dimensions, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { height, width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in both username and password.');
      return;
    }

    try {
      const userSnapshot = await firestore()
        .collection('users')
        .where('username', '==', username)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        Alert.alert('Error', 'Username not found. Please register first.');
        return;
      }

      const userData = userSnapshot.docs[0].data();
      const email = userData.email;

      const user = await auth().signInWithEmailAndPassword(email, password);
      console.log('Logged in with user: ', user);

      navigation.navigate('ProfileScreen');
    } catch (error) {
      console.error('Login error:', error);

      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('Error', 'Too many requests. Please try again later.');
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Agriya_white.png')} style={styles.logo} />
      
      <View style={styles.formContainer}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#777"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Don't have an account?{' '}
          <Text 
            style={styles.registerNow} 
            onPress={() => navigation.navigate('SignupScreen')}
          >
            Register Now
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#11AB2F',
  },
  logo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    position: 'absolute',
    top: -30,
  },
  formContainer: {
    width: width, 
    height: height * 0.6,
    backgroundColor: '#F8F8F8',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0, 
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  signInButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#11AB2F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  orText: {
    fontSize: 16,
    color: '#777',
    marginVertical: 10,
  },
  googleButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  registerText: {
    fontSize: 14,
    color: '#777',
    marginTop: 15,
  },
  registerNow: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#11AB2F',
  },
});

export default LoginScreen;