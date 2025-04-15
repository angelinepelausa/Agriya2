import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, TextInput, StyleSheet, Dimensions, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { height, width } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const checkIfUserExists = async (email, username) => {
    const usersRef = firestore().collection('users');
    const emailExists = await usersRef.where('email', '==', email).get();
    const usernameExists = await usersRef.where('username', '==', username).get();

    if (!emailExists.empty) {
      return 'Email already in use';
    }

    if (!usernameExists.empty) {
      return 'Username already taken';
    }

    return null;
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignUp = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters and include a combination of uppercase, lowercase, numbers, and symbols.');
      return;
    }

    setLoading(true);
    const userExists = await checkIfUserExists(email, username);
    if (userExists) {
      Alert.alert('Error', userExists);
      setLoading(false);
      return;
    }

    try {
      await auth().createUserWithEmailAndPassword(email, password);

      const user = auth().currentUser;
      await firestore().collection('users').doc(user.uid).set({
        email,
        username,
        password, 
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('LoginScreen');
    } catch (error) {
      Alert.alert('Error', error.message);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Agriya_white.png')} style={styles.logo} />

      <View style={styles.formContainer}>
        <Text style={styles.welcomeText}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
        />

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

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignUp}
          disabled={loading} 
        >
          <Text style={styles.signInButtonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleButtonText}>Sign Up with Google</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Already have an account?{' '}
          <Text style={styles.registerNow} onPress={() => navigation.navigate('LoginScreen')}>
            Sign In
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

export default SignupScreen;
