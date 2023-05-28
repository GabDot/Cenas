import { View, Text, StyleSheet,ScrollView,RefreshControl,Button,ActivityIndicator } from 'react-native'
import Header from '../components/Header';
import firebase from 'firebase';
import { global } from "../styles/globals";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';
import NetInfo from '@react-native-community/netinfo';
import * as OpenAnything from "react-native-openanything"
import { TouchableOpacity } from 'react-native-gesture-handler';

const Ementa = () => {
  const [ementaData, setEmentaData] = useState(null);
  const [isConnected, setIsConnected] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading,setIsLoading] = useState(true);
  const API_URL = 'https://geweb3.cic.pt/GEWebApi/token';
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
       
        setIsLoading(false)
        return;
      }
      const dataToken = await response.json();
      console.log(dataToken.access_token)
      await AsyncStorage.setItem('token', dataToken.access_token);
      const expirationTime = Date.now() + dataToken.expires_in * 1000;
      await AsyncStorage.setItem('expirationTime', expirationTime.toString());
      
      checkUser(dataToken.access_token)
    }else{
      
      
      
      setIsLoading(false)
      
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

  const onRefresh = () => {
    setRefreshing(true);
    if(isConnected){
      handleSync()
    }
    // Call a function to fetch new data here
    wait(2000).then(() => setRefreshing(false));
  };

   
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}


  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(isConnected);
      setIsConnected(state.isConnected);

    });
    const getDataEmenta = async () => {
      const ementa = await AsyncStorage.getItem('ementa')
      if(ementa !== null){
        setEmentaData(JSON.parse(ementa))
      }

    } 
    if(isConnected){

    
    const db = firebase.database();
    db.ref('/ementa').on('value', snapshot => {
      const data = snapshot.val();
      const filteredData = Object.keys(data)
        .filter(key => {
          const date = moment(data[key].Dta, 'YYYY-M-D');
          return date.isSame(moment(), 'week');
        })
        .map(key => data[key])
        .sort((a, b) => moment(a.Dta, 'YYYY-M-D').diff(moment(b.Dta, 'YYYY-M-D')));
      setEmentaData(filteredData);
      
      AsyncStorage.setItem('ementa',JSON.stringify(filteredData))
      setIsLoading(false)
    });
  }
  else{
    getDataEmenta()
    setIsLoading(false)
  }
  return () => {
    unsubscribeNetInfo();
  };
  }, [isConnected,refreshing]);

  if (!ementaData) {
    return <Text>Loading...</Text>;
  }

  return (
    
    isLoading ? (
      <View style={{ flex: 1 }}>
         <Header></Header>
         <ActivityIndicator size={100} color='#9A9DBE'/>
        </View>
        
      ):(
    <View  style={{flex:1}}>
      <Header></Header>
      <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <ScrollView style={{flex:1}}>
      {Object.keys(ementaData).map(key => {
        const dayData = ementaData[key];
        const date = dayData.Dta;
       
        return (
          <View key={key} style={{ marginTop: 10 }}>
            <View
              style={[
                styles.container,
                moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { backgroundColor: '#D0247A' },
              ]}
            >
              <Text
                style={[
                  {
                    borderBottomWidth: 1,
                    
                    marginBottom: 10,
                    borderBottomColor: '#B5B4B4',
                  },
                  global.h2,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                {moment(date, 'YYYY-M-D').locale('pt-br').format('dddd').toUpperCase()} | {date}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                CARNE:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Carne}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                PEIXE:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Peixe}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                DIETA:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Dieta}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                VEGETARIANO:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Vegetariano}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                SOBREMESA:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Sobremesa}
              </Text>
              
            </View>
          </View>
        );
      })}
     </ScrollView>
     </ScrollView>
    </View>
   
  )
  )
};
export default Ementa;
const styles = StyleSheet.create({
    container: {
        paddingHorizontal:18,
        paddingVertical:25
        
    },
    title:{
      
    }
})