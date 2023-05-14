import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard,TouchableWithoutFeedback,ActivityIndicator } from 'react-native';
import { global } from "../styles/globals";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { auth } from '../firebase';
import firebase from 'firebase';
import Modal from "react-native-modal";
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons'
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import ErrorModal from '../components/ErrorModal';

export default function Login({navigation, isLoggedIn, setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [webViewRef, setWebViewRef] = useState(null);
  const [message,setMessage] = useState('');
  const [isConnected,setIsConnected] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("K7f5nKEe-3shJen7p06T9rLeX0SB9JezV3N8iYvhMykezFEs-_JBKUnmAgV-Oxf0IV7cAMowE-VL15ra2AS6muRlthakOEEWcOMDVKN9yAuIni6r1owQ51-EDokr7IZZyKuEc1ir9tM07BfHNHtgDY8QV81oMmJh_vaFaZluq-nfkKSlbj6s0XzA7q7r_dNpia86uJoQ-lTxA556eJrUDyiDwuO3zep9fNKUMt5lpOH1acE8YJINL0RBUhTASfDLTfNo_NxkZiR_KyQ5xtSS-9ihDF2yT557IQ-F8_NMWcg");
  const [data,setData] = useState();
  const API_URL = 'https://geweb3.cic.pt/GEWebApi/token';

 
  const handleLogin = async () => {
    setIsLoading(true);
    if(isConnected){
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=password&username=${username}&password=${password}`,
      });
  
      if (!response.ok) {
        console.log('Error:', response.status);
        setMessage('Palavra passe errada ou utilizador inválido.');
        setIsLoading(false)
        setModalVisible(true);
        return;
      }
      const dataToken = await response.json();
      setToken(dataToken.access_token);
      console.log(dataToken.access_token)
      await AsyncStorage.setItem('token', dataToken.access_token);
      const expirationTime = Date.now() + dataToken.expires_in * 1000;
      await AsyncStorage.setItem('expirationTime', expirationTime.toString());
      console.log(username),
      console.log(password)
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('password', password);
      
      checkUser(dataToken.access_token)
      setIsLoggedIn(true)
    }else{
      setMessage('Falha na conexão');
      
      setModalVisible(true);
    }
   setIsLoading(false)
  };
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      console.log(isConnected)
    });
  
    return () => {
      
      unsubscribe();
    };
  },[isConnected])
  async function checkUser(token) {
    const exists = await checkUserExists(username);
    if (exists) {
      console.log('User exists');
      const data = await getData(token);
      const events = await getEvents(token);
      updateUser(data.NomeUtil, data, events);
    } else {
      console.log('User added');
      const data = await getData(token);
      const events = await getEvents(token);
      createUser(data.NomeUtil, data, events);
     
    }
  }
  const checkAuthentication = async () => {
    const auth = await AsyncStorage.getItem('token');
    console.log(auth)
    const expirationTime = await AsyncStorage.getItem('expirationTime');
    const currentTime = Date.now();
  
   if(auth && currentTime < parseInt(expirationTime)){
    console.log(true)
    setIsLoggedIn(true)
   }
   else{
    console.log(false)
   }
  };
  const getData = async (token) => {
    
  
    const response = await fetch('https://geweb3.cic.pt/GEWebApi/api/user/_current', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (response.ok) {
      const dataResponse = await response.json();
      return dataResponse
    } else {
      
    }
  };
  const getEvents = async (token) => {
   
  
    const response = await fetch('https://geweb3.cic.pt/GEWebApi/api/event', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (response.ok) {
      const dataResponse = await response.json();
      return dataResponse.map(({ Titulo, Tipo, DtaIni }) => ({
        Titulo,
        Tipo,
        DtaIni: DtaIni.split('T')[0],
      }));
    } else {
      // ...
    }
  };
  const checkUserExists = async (NomeUtil) => {
    const dbRef = firebase.database().ref(`users/${NomeUtil}`);
    const snapshot = await dbRef.once('value');
    return snapshot.exists();
  }
  const createUser = async (NomeUtil, data, events) => {
    const dbRef = firebase.database().ref(`users/${NomeUtil}/info`);
    const dbRef2 = firebase.database().ref(`users/${NomeUtil}/events`);
    AsyncStorage.setItem('data', JSON.stringify(data));
    AsyncStorage.setItem('nomeUtil',NomeUtil);
    AsyncStorage.setItem('ano',data.Ano);
    AsyncStorage.setItem('turma',data.Turma);
    AsyncStorage.setItem('usernameHome',data.NomeAbrev);
    AsyncStorage.setItem('events', JSON.stringify(events));
    await dbRef.set(data);
    await dbRef2.set(events);
    
  }
  const updateUser = async (NomeUtil, data,events) => {
    const dbRef = firebase.database().ref(`users/${NomeUtil}/info`);
    const dbRef2 = firebase.database().ref(`users/${NomeUtil}/events`);
    AsyncStorage.setItem('data', JSON.stringify(data));
    AsyncStorage.setItem('nomeUtil',NomeUtil);
    AsyncStorage.setItem('ano',data.Ano);
    AsyncStorage.setItem('turma',data.Turma);
    AsyncStorage.setItem('usernameHome',data.NomeAbrev);
    AsyncStorage.setItem('events', JSON.stringify(events));
    await dbRef.set(data);
    await dbRef2.set(events);
   
  }

  useEffect(() => {
    checkAuthentication();
  }, []);



  return (
    isLoading ? (
      <View style={styles.container}> 
    <ActivityIndicator size={100} color="white" />
    <View style={styles.circle}></View>
    </View>
    

    ):(
      <>
   
    <ErrorModal visible={modalVisible}  onClose={() => setModalVisible(false)} message={message}></ErrorModal>
    


    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>  
    <Text style={[global.h1,styles.title]}>LOGIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Utilizador"
        onChangeText={setUsername}
        value={username}
        autoCapitalize="none"
        keyboardType="default"
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
    </>
    )
    
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
    
  },modalHeader: {
    flexDirection: 'row',
    alignItems:'center',
    paddingBottom: 20
},
closeButon: {
    position: 'absolute',
    left:330,
    paddingBottom:20
}
 
});
