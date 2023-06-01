import React, { useState, useEffect, useDebugValue } from 'react';
import { View, Text, StyleSheet,ScrollView, Pressable,RefreshControl,ActivityIndicator } from 'react-native';
import firebase from 'firebase';
import Collapsible from 'react-native-collapsible';
import Header from '../components/Header';
import { global } from '../styles/globals';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

const Classificacoes = () => {
  const [classificacoes, setClassificacoes] = useState({});
  const [activeSections, setActiveSections] = useState([]);
  const [activeTests, setActiveTests] = useState([]);
  const [isConnected, setIsConnected] = useState();
  const [nomeUtil,setNomeUtil] = useState();
  const[activeSemesters,setActiveSemesters] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading,setIsLoading] = useState(true);
  const tk = 'Y-WywHe6uXAVa9z9yfUZVfEuODDRzbftZ-0JylWY0kqb46MXL9FYloflIO5vnj4vPS1V3hJ4aP0YasupkgI0FdpvYBt9PCcGDdd5lbGazugYZWvy0YiPPdCeuYkJS5Wr5JRZEC3jye8r3LXQSM3QM673d-uXXbeL_VmWrd8NGa3LlcRonsgqT6aNLoRcqpSZBNQBkRTc1e2g-NU82g4b-7bNDU1sJyp0KuiBVHggwO9dH5kOwAa3rN1oivBW0jtedDeYNEQe8QAMYWxGXviIg3X9TIbzPX7dSt759rJtK92ecqd8e60bRyTOcOUMhD8z';
  const API_URL = 'https://geweb3.cic.pt/GEWebApi/token';
  
  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(isConnected);
      setIsConnected(state.isConnected);

    });
    
 
    
    const getDataClass = async () => {
      const classificacoes = await AsyncStorage.getItem('classificacoes')
      if(classificacoes !== null){
        setClassificacoes(JSON.parse(classificacoes))
        setIsLoading(false)
      }

    } 

    if(isConnected){
      async function fetchData() {

        const parser = new XMLParser();
        const userData =  await AsyncStorage.getItem('user')
        const tokenData =  await AsyncStorage.getItem('token')
        console.log("user",JSON.stringify(userData))
        console.log("token",tokenData)
        const details = {
          'tk':tokenData,
          'user':userData

        };
      
        var formBody = [];
        for (var property in details) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(details[property]);
          formBody.push(encodedKey + "=" + encodedValue);
          
        }
        formBody = formBody.join("&");
      
        const response = await fetch('https://www.cic.pt/alunos/srvconsultaclassifica.asp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=ISO-8859-1'
          },
          body: formBody
        });

        const blob = await response.blob();
  const text = await convertBlobToText(blob, 'ISO-8859-1');

  const data = parser.parse(text);

 setClassificacoes(data)
  AsyncStorage.setItem('classificacoes', JSON.stringify(data));
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
      setTimeout(getDataClass, 1500);
      

    }
    return () => {
      unsubscribeNetInfo();
    };
  }, [isConnected,nomeUtil]);
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
      handleSync();

    }
    
    // Call a function to fetch new data here
    wait(2000).then(() => setRefreshing(false));
  };

  const toggleExpanded = (collapsibleIndex, testIndex) => {
    if (testIndex === undefined) {
      let updatedActiveSections = [...activeSections];
      if (updatedActiveSections.includes(collapsibleIndex)) {
        updatedActiveSections = updatedActiveSections.filter(i => i !== collapsibleIndex);
      } else {
        updatedActiveSections.push(collapsibleIndex);
      }
      setActiveSections(updatedActiveSections);
    } else {
      let updatedActiveTests = [...activeTests];
      const testIsActive = updatedActiveTests.some(
        test => test.collapsibleIndex === collapsibleIndex && test.testIndex === testIndex
      );
      if (testIsActive) {
        updatedActiveTests = updatedActiveTests.filter(
          test => !(test.collapsibleIndex === collapsibleIndex && test.testIndex === testIndex)
        );
      } else {
        updatedActiveTests.push({ collapsibleIndex, testIndex });
      }
      setActiveTests(updatedActiveTests);
    }
  };
  return (
    
    isLoading || !classificacoes.classificacoes ? (
      <View style={{ flex: 1 }}>
         <Header></Header>
         <ActivityIndicator size={100} color='#9A9DBE'/>
        </View>
        
      ):(
    classificacoes && (
    <View style={{flex:1}}>
    <Header></Header>
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
    
    <View style={styles.container}>
      <Text style={[global.h2,{marginBottom:10}]}>Classificações</Text>
      {Array.isArray(classificacoes.classificacoes.disciplina) && classificacoes.classificacoes.disciplina.map((item, index) => (
  <View key={index}>
    <Pressable onPress={() => toggleExpanded(index)} style={{ backgroundColor: '#778ca3', padding: 10, marginBottom: 10, marginTop: 10, borderRadius: 10 }}>
      <Text style={[global.h3, { color: 'white' }]}>{item.nome}</Text>
    </Pressable>
    <Collapsible collapsed={!activeSections.includes(index)}>
      {Array.isArray(item.classifica) ? item.classifica.map((test, testIndex) => (
        <View key={testIndex}>
        <Pressable onPress={() => toggleExpanded(index, testIndex)} style={{ backgroundColor: '#9abebb', padding: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginTop: 5 }}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={[global.h3,{color:'white',fontSize:16}]}>{test.data}</Text>
            <Text style={[global.h3,{color:'white',fontSize:16}]}>{test.nota}</Text>
          </View>
        </Pressable>
        <Collapsible
          collapsed={
            !activeTests.some(
              (testItem) => testItem.collapsibleIndex === index
            )
          }
        >
          <View style={{ backgroundColor: 'white', marginBottom: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, padding: 10 }}>
            {test.tipo && (
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Text style={[global.p, { fontWeight: 'bold' }]}>Tipo: </Text>
                <Text style={[global.p]}>{test.tipo}</Text>
              </View>
            )}
            {test.peso && (
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Text style={[global.p, { fontWeight: 'bold' }]}>Peso: </Text>
                <Text style={[global.p]}>{test.peso}</Text>
              </View>
            )}
            {test.escala && (
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Text style={[global.p, { fontWeight: 'bold' }]}>Escala: </Text>
                <Text style={[global.p]}>{test.escala}</Text>
              </View>
            )}
            {test.nota && (
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Text style={[global.p, { fontWeight: 'bold' }]}>Nota: </Text>
                <Text style={[global.p]}>{test.nota}</Text>
              </View>
            )}
            {test.prof && (
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Text style={[global.p, { fontWeight: 'bold' }]}>Professor: </Text>
                <Text style={[global.p]}>{test.prof}</Text>
              </View>
            )}
          </View>
        </Collapsible>
      </View>
      )) : (
        // handle the case where item.classifica is not an array
        <View>
          <Pressable onPress={() => toggleExpanded(index, 0)} style={{ backgroundColor: '#9abebb', padding: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginTop: 5 }}>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={[global.h3,{color:'white',fontSize:16}]}>{item.classifica.data}</Text>
              <Text style={[global.h3,{color:'white',fontSize:16}]}>{item.classifica.nota}</Text>
            </View>
          </Pressable>
          <Collapsible
            collapsed={
              !activeTests.some(
                (testItem) => testItem.collapsibleIndex === index
              )
            }
          >
            <View style={{ backgroundColor: 'white', marginBottom: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, padding: 10 }}>
              {item.classifica.tipo && (
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={[global.p, { fontWeight: 'bold' }]}>Tipo: </Text>
                  <Text style={[global.p]}>{item.classifica.tipo}</Text>
                </View>
              )}
              {item.classifica.peso && (
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={[global.p, { fontWeight: 'bold' }]}>Peso: </Text>
                  <Text style={[global.p]}>{item.classifica.peso}</Text>
                </View>
              )}
              {item.classifica.escala && (
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={[global.p, { fontWeight: 'bold' }]}>Escala: </Text>
                  <Text style={[global.p]}>{item.classifica.escala}</Text>
                </View>
              )}
              {item.classifica.nota && (
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={[global.p, { fontWeight: 'bold' }]}>Nota: </Text>
                  <Text style={[global.p]}>{item.classifica.nota}</Text>
                </View>
              )}
              {item.classifica.prof && (
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={[global.p, { fontWeight: 'bold' }]}>Professor: </Text>
                  <Text style={[global.p]}>{item.classifica.prof}</Text>
                </View>
              )}
            </View>
          </Collapsible>
        </View>
      )}
    </Collapsible>
  </View>
))}
    



    </View>
    
    </ScrollView>
    </ScrollView>
    </View>
    )
  )
  )
};

export default Classificacoes;

const styles = StyleSheet.create({
  container: {
    paddingVertical: '2%',
    paddingBottom:'30%',
    paddingHorizontal: '3%',
    height: '100%',
  },
});