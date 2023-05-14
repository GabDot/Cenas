import { View, Text,StyleSheet, ScrollView,Image,RefreshControl,TouchableOpacity,ActivityIndicator, Alert } from 'react-native'
import { useState,useEffect } from 'react';
import Header from '../components/Header';
import { global } from '../styles/globals';
import firebase from 'firebase/app';
import { database } from '../firebase';
import 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
export default function User({isLoggedIn,setIsLoggedIn}) {
  const [data,setData] = useState([]);
  const db = firebase.database();
  const [isConnected,setIsConnected] = useState();
  const [isLoading,setIsLoading] = useState(true);
  const API_URL = 'https://geweb3.cic.pt/GEWebApi/token';
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      console.log(isConnected)
    });
  
    return () => {
      
      unsubscribe();
    };
  },[isConnected])
  const handleSync = async () => {
    setIsLoading(true);
    const username = await AsyncStorage.getItem('username');
    const password = await AsyncStorage.getItem('password');
    console.log(username)
    console.log(password)
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
        
        setIsLoading(false)
        Alert.alert('Erro','Erro na sincronização')
        return;
      }
      const dataToken = await response.json();
      console.log(dataToken.access_token)
      await AsyncStorage.setItem('token', dataToken.access_token);
      const expirationTime = Date.now() + dataToken.expires_in * 1000;
      await AsyncStorage.setItem('expirationTime', expirationTime.toString());
      
      checkUser(dataToken.access_token)
    }else{
      
      Alert.alert('Erro','Falha na conexão')
      setModalVisible(true);
      
    }
   setIsLoading(false)
   
  };
  async function checkUser(token) {
    const username = await AsyncStorage.getItem('username');
    const exists = await checkUserExists(username);
    if (exists) {
      console.log('User exists');
      const data = await getData(token);
      const events = await getEvents(token);
      updateUser(data.NomeUtil, data, events);
    }
  }
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
      Alert.alert('Sincronização','Sincronização bem sucedida')
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
  const updateUser = async (NomeUtil, data,events) => {
    const dbRef = firebase.database().ref(`users/${NomeUtil}/info`);
    const dbRef2 = firebase.database().ref(`users/${NomeUtil}/events`);
    AsyncStorage.setItem('data', JSON.stringify(data));
    AsyncStorage.setItem('nomeUtil',NomeUtil);
    AsyncStorage.setItem('ano',JSON.stringify(data.Ano));
    AsyncStorage.setItem('turma',data.Turma);
    AsyncStorage.setItem('events', JSON.stringify(events));
    await dbRef.set(data);
    await dbRef2.set(events);
   
  }
 
  useEffect(() => {
    
    const getData = async () => {
      const dataAPI = await AsyncStorage.getItem('data');
      console.log(dataAPI);
      setData(JSON.parse(dataAPI));
      setIsLoading(false)
    };
  
    setTimeout(getData, 1500);
  }, []);
  const handleSignOut = async () => {
    setIsLoggedIn(false);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('eventP');
    await AsyncStorage.removeItem('events');
    await AsyncStorage.removeItem('data');
  }
    return (
       !isLoading ? (
        <View style={{flex:1}}>
            <Header></Header>
         
                <View style={styles.profilePictureContainer}>
                       
                        <Text style={[global.h2,{marginTop:10,marginBottom:20}]}>{data.NomeAbrev}</Text>
                    </View>
               <View style={styles.body}>
                   <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                   <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>Número</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{data.NumAluno}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>Ano</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{data.Ano}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>Turma</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{data.Turma}</Text>
                    </View>

                </ScrollView>
                
                <TouchableOpacity onPress={() => handleSync()} style={{justifyContent:'center',alignItems:'center',marginVertical:10,backgroundColor:'#778ca3',padding:10,borderRadius:10}} ><Text style={[global.h3,{color:'white'}]}>Sincronizar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSignOut()} style={{justifyContent:'center',alignItems:'center',marginVertical:10,backgroundColor:'#be9a9b',padding:10,borderRadius:10}} ><Text style={[global.h3,{color:'white'}]}>Sign out</Text></TouchableOpacity>
                </View>
                

            
 
        </View>

       ):(
        <View style={{flex:1}}>
          <Header></Header>
          <View style={styles.body}>
            <ActivityIndicator size={100} color='#9A9DBE'/>
       </View>
        </View>
       )
        
    )
}

const styles = StyleSheet.create({
    container:{
        height:'auto',
        backgroundColor:'white',
        padding:15,
        borderRadius:10,
    },
    body:{
        marginHorizontal:18,
    },
   
    section:{
        marginBottom:20,
    },profilePictureContainer: {
        marginTop:10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      profilePicture: {
        width: 150,
        height: 150,
        borderRadius: 100,
        resizeMode:'contain'
      }

})
