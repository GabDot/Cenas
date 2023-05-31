import { View, Text, StyleSheet,ScrollView,RefreshControl,Button,ActivityIndicator } from 'react-native'
import Header from '../components/Header';
import firebase from 'firebase';
import { global } from "../styles/globals";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';
import NetInfo from '@react-native-community/netinfo';
import RadioInput from '../components/radio';
import * as OpenAnything from "react-native-openanything"
import { TouchableOpacity } from 'react-native-gesture-handler';
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const Ementa = () => {
  const [ementaData, setEmentaData] = useState(null);
  const [isConnected, setIsConnected] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading,setIsLoading] = useState(true);
  const [date1,setDate1] = useState();
  const today = new Date();
  const [date2,setDate2] = useState();
  const tk = 'Y-WywHe6uXAVa9z9yfUZVfEuODDRzbftZ-0JylWY0kqb46MXL9FYloflIO5vnj4vPS1V3hJ4aP0YasupkgI0FdpvYBt9PCcGDdd5lbGazugYZWvy0YiPPdCeuYkJS5Wr5JRZEC3jye8r3LXQSM3QM673d-uXXbeL_VmWrd8NGa3LlcRonsgqT6aNLoRcqpSZBNQBkRTc1e2g-NU82g4b-7bNDU1sJyp0KuiBVHggwO9dH5kOwAa3rN1oivBW0jtedDeYNEQe8QAMYWxGXviIg3X9TIbzPX7dSt759rJtK92ecqd8e60bRyTOcOUMhD8z';
  const API_URL = 'https://geweb3.cic.pt/GEWebApi/token';
  
  const [apiData, setApiData] = useState({});

  
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
  };
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
    // const getDataEmenta = async () => {
    //   const ementa = await AsyncStorage.getItem('ementa')
    //   if(ementa !== null){
    //     setEmentaData(JSON.parse(ementa))
    //   }

    // } 
    if(isConnected){
      setIsLoading(true)
      async function fetchData() {
        const parser = new XMLParser();
        
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        const dt1 = formatDate(firstDayOfWeek);
        const dt2 = formatDate(lastDayOfWeek);
        setDate1(moment(dt1, 'DD/MM/YYYY').startOf('day'))
        setDate2(moment(dt2, 'DD/MM/YYYY').startOf('day'))
        const details = {
          'tk':tk,
          'dt1': dt1,
          'dt2': dt2,

        };
      
        var formBody = [];
        for (var property in details) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(details[property]);
          formBody.push(encodedKey + "=" + encodedValue);
          
        }
        formBody = formBody.join("&");
      
        const response = await fetch('https://www.cic.pt/alunos/srvlistamenu.asp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=ISO-8859-1'
          },
          body: formBody
        });

        const blob = await response.blob();
  const text = await convertBlobToText(blob, 'ISO-8859-1');

  const data = parser.parse(text);
  setEmentaData(data);
  AsyncStorage.setItem('ementa', JSON.stringify(data));
  setIsLoading(false);
}

async function convertBlobToText(blob, encoding) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(blob, encoding);
  });

      }
   fetchData()
      
    
  }
  else{
    //getDataEmenta()
    setIsLoading(false)
  }
  return () => {
    unsubscribeNetInfo();
  };
  }, [isConnected,refreshing]);
  // useEffect(() => {
  //   async function fetchData(date) {
  //     const parser = new XMLParser();
  //     const details = {
  //       'tk': 'abc',
  //       'dt': date,
  //       'user': '1549'
  //     };
    
  //     var formBody = [];
  //     for (var property in details) {
  //       var encodedKey = encodeURIComponent(property);
  //       var encodedValue = encodeURIComponent(details[property]);
  //       formBody.push(encodedKey + "=" + encodedValue);
  //     }
  //     formBody = formBody.join("&");
    
  //     const response = await fetch('https://www.cic.pt/alunos/srvconsultarefeicao.asp', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  //       },
  //       body: formBody
  //     });
  //     const text = await response.text();
  //     const data = parser.parse(text);
  //     setApiData(prevData => ({ ...prevData, [date]: data }));
      
  //   }
  //   if (ementaData) {
  //     Object.keys(ementaData).forEach(key => {
  //       const dayData = ementaData[key];
  //       const date = dayData.Dta;
  //       fetchData(date);
  //     });
  //   }
  // }, [ementaData, refreshing]);
  if (!ementaData) {
    return <Text>Loading...</Text>;
  }
  const menuData = ementaData.ementa.menu;
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

      {menuData.map((dayData, index) => {
      const date = dayData.data;
      const dateComp = moment(dayData.data, 'DD/MM/YYYY').startOf('day')
      const carne = dayData.normal["#text"] || dayData.normal
      const peixe = dayData.opcao["#text"] || dayData.peixe;
      const dieta = dayData.dieta["#text"] || dayData.dieta;
      const vegetariano =  dayData.vegetariano["#text"] || dayData.vegetariano;
      const sobremesa = dayData.sobremesa["#text"] || dayData.sobremesa;
        
       
        return (
          <View key={index} style={{ marginTop: 10 }}>
            <View
              style={[
                styles.container,
                moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { backgroundColor: '#D0247A' },
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
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                {moment(date, 'DD/MM/YYYY').locale('pt-br').format('dddd').toUpperCase()} | {date}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                CARNE:
              </Text>
              <Text style={[global.p, moment(date,'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {carne}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                PEIXE:
              </Text>
              <Text style={[global.p, moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {peixe}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                DIETA:
              </Text>
              <Text style={[global.p, moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {dieta}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                VEGETARIANO:
              </Text>
              <Text style={[global.p, moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {vegetariano}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                SOBREMESA:
              </Text>
              <Text style={[global.p, moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {sobremesa}
              </Text>
              {console.log("date",dateComp)}
              
              {dateComp>today?(
                <RadioInput date={date} refreshing={refreshing}/>
              ):
              (
                <Text style={[global.h3,{marginTop:10}]}>Não é possível marcar senha para este dia</Text>
              )}
              

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