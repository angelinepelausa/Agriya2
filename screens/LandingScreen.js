import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/Agriya_white.png')} style={styles.logo} />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11AB2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    position: 'absolute',
    top: '10%', 
  },  
  button: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#F8F8F8',
    paddingVertical: 12,
    paddingHorizontal: 70, 
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18, 
    color: '#3D3D38',
    fontFamily: 'Amaranth-Regular', 
    fontWeight: 'bold',
  },  
});

export default LandingScreen;