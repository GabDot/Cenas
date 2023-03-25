import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard,TouchableWithoutFeedback } from 'react-native';
import { global } from "../styles/globals";
import { Dimensions } from 'react-native';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

export default function Login({navigation, isLoggedIn, setIsLoggedIn }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
 
  const handleLogin = () => {
    auth
     .signInWithEmailAndPassword(email,password)
     .then(userCredentials => {
        const user = userCredentials.user;
        
     })
     .catch(error => alert(error.message))
     

  };
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        if(user){
            setIsLoggedIn(true);
        }
    })
   return unsubscribe;
  },[])

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>  
    <Text style={[global.h1,styles.title]}>LOGIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={[global.h2,styles.buttonText]}>ENTRAR</Text>
      </TouchableOpacity>
      <View style={styles.circle}></View>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9A9DBE',
  },
  title: {
    backgroundColor:'#FFFFFF',
    marginBottom: 24,
    paddingHorizontal:8,
    paddingBottom:3,

  },
  input: {
    width: '80%',
    height: 40,
    padding: 12,
    borderRadius: 10,
    backgroundColor:'#FFFFFF',
    marginBottom: 16,
    color:'#9D9B9B',
  },
  button: {
    width: '80%',
    height: 48,
    backgroundColor: '#D0247A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    
    
  },
  circle:{
    position: 'absolute',
    backgroundColor: '#F6F6F6',
    width: Dimensions.get('window').width * 2.5,
    height: Dimensions.get('window').height * 1.5,
    left: -Dimensions.get('window').width * 1.2,
    top:Dimensions.get('window').height * 0.83,
    zIndex: 2,
    borderRadius: Dimensions.get('window').width * 9.99, 
    
  },
 
});
