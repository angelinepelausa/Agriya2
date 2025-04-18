import React, { useState, useEffect } from 'react';
import { View , Image , TouchableOpacity , Text , TextInput , StyleSheet , Dimensions, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { height, width } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      checkAvailability(email, username);
    }, 500);

    return () => clearTimeout(timeout);
  }, [email, username]);

  useEffect(() => {
    if (!password) {
      setPasswordStatus('');
    } else if (!validatePassword(password)) {
      setPasswordStatus('Password too weak');
    } else {
      setPasswordStatus('Password is strong');
    }
  }, [password]);

  const checkAvailability = async (emailVal, usernameVal) => {
    const usersRef = firestore().collection('users');

    if (emailVal) {
      const emailCheck = await usersRef.where('email', '==', emailVal).get();
      setEmailStatus(!emailCheck.empty ? 'Email already in use' : 'Email available');
    } else {
      setEmailStatus('');
    }

    if (usernameVal) {
      const usernameCheck = await usersRef.where('username', '==', usernameVal).get();
      setUsernameStatus(!usernameCheck.empty ? 'Username taken' : 'Username available');
    } else {
      setUsernameStatus('');
    }
  };

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(pass);
  };

  const handleSignUp = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
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
          />
          {emailStatus ? (
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
          />
          {usernameStatus ? (
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
          />
          {passwordStatus ? (
            <Text style={[styles.statusText, { color: passwordStatus.includes('strong') ? 'green' : 'red' }]}>
              {passwordStatus}
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