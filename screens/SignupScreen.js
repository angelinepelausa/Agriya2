import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, TextInput, StyleSheet, Dimensions, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { height, width } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [confirmPasswordStatus, setConfirmPasswordStatus] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (focusedField === 'email') {
        checkEmailAvailability(email);
      } else if (focusedField === 'username') {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [email, username, focusedField]);

  useEffect(() => {
    if (focusedField === 'password') {
      if (!password) {
        setPasswordStatus('');
      } else if (!validatePassword(password)) {
        setPasswordStatus('Password too weak');
      } else {
        setPasswordStatus('Password is strong');
      }
    }
  }, [password, focusedField]);

  useEffect(() => {
    if (focusedField === 'confirmPassword') {
      if (!confirmPassword) {
        setConfirmPasswordStatus('');
      } else if (confirmPassword !== password) {
        setConfirmPasswordStatus('Passwords do not match');
      } else {
        setConfirmPasswordStatus('Passwords match');
      }
    }
  }, [confirmPassword, password, focusedField]);

  const checkEmailAvailability = async (emailVal) => {
    if (!emailVal) {
      setEmailStatus('');
      return;
    }
    const usersRef = firestore().collection('users');
    const emailCheck = await usersRef.where('email', '==', emailVal).get();
    setEmailStatus(!emailCheck.empty ? 'Email already in use' : 'Email available');
  };

  const checkUsernameAvailability = async (usernameVal) => {
    if (!usernameVal) {
      setUsernameStatus('');
      return;
    }
    const usersRef = firestore().collection('users');
    const usernameCheck = await usersRef.where('username', '==', usernameVal).get();
    setUsernameStatus(!usernameCheck.empty ? 'Username taken' : 'Username available');
  };

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(pass);
  };

  const handleSignUp = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Weak password.');
      return;
    }

    setLoading(true);

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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
          {focusedField === 'email' && emailStatus ? (
            <Text style={[styles.statusText, { color: emailStatus.includes('available') ? 'green' : 'red' }]}>
              {emailStatus}
            </Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#777"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
          />
          {focusedField === 'username' && usernameStatus ? (
            <Text style={[styles.statusText, { color: usernameStatus.includes('available') ? 'green' : 'red' }]}>
              {usernameStatus}
            </Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#777"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
          {focusedField === 'password' && passwordStatus ? (
            <Text style={[styles.statusText, { color: passwordStatus.includes('strong') ? 'green' : 'red' }]}>
              {passwordStatus}
            </Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#777"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField(null)}
          />
          {focusedField === 'confirmPassword' && confirmPasswordStatus ? (
            <Text style={[styles.statusText, { color: confirmPasswordStatus === 'Passwords match' ? 'green' : 'red' }]}>
              {confirmPasswordStatus}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
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
  inputContainer: {
    width: '90%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  statusText: {
    textAlign: 'left',
    width: '100%',
    marginTop: 2,
    marginBottom: 2,
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
