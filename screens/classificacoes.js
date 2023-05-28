import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,ScrollView, Pressable,RefreshControl,ActivityIndicator } from 'react-native';
import firebase from 'firebase';
import Collapsible from 'react-native-collapsible';
import Header from '../components/Header';
import { global } from '../styles/globals';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Classificacoes = () => {
  const [classificacoes, setClassificacoes] = useState({});
  const [activeSections, setActiveSections] = useState([]);
  const [activeTests, setActiveTests] = useState([]);
  const [isConnected, setIsConnected] = useState();
  const [nomeUtil,setNomeUtil] = useState();
  const[activeSemesters,setActiveSemesters] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading,setIsLoading] = useState(true);
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
        
      }

    } 

    if(isConnected){
      const getDataDatabase = async () => {
        const nomeUtil = await AsyncStorage.getItem('nomeUtil');
      
      const dbRef = firebase.database().ref(`/users/${nomeUtil}/classificacoes`);
      dbRef.on('value', snapshot => {
        setClassificacoes(snapshot.val());
        AsyncStorage.setItem('classificacoes',JSON.stringify(snapshot.val()))
      });
      setIsLoading(false)
    }
    setTimeout(getDataDatabase, 1000);
    
    }
    else{
      getDataClass()
      setIsLoading(false)

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

  const toggleExpanded = (classIndex, semesterIndex, testIndex) => {
    if (semesterIndex === undefined) {
      // handle expanding/collapsing class collapsible
      let updatedActiveSections = [...activeSections];
      if (updatedActiveSections.includes(classIndex)) {
        updatedActiveSections = updatedActiveSections.filter(i => i !== classIndex);
      } else {
        updatedActiveSections.push(classIndex);
      }
      setActiveSections(updatedActiveSections);
    } else if (testIndex === undefined) {
      // handle expanding/collapsing semester collapsible
      let updatedActiveSemesters = [...activeSemesters];
      const semesterIsActive = updatedActiveSemesters.some(
        semester => semester.classIndex === classIndex && semester.semesterIndex === semesterIndex
      );
      if (semesterIsActive) {
        updatedActiveSemesters = updatedActiveSemesters.filter(
          semester => !(semester.classIndex === classIndex && semester.semesterIndex === semesterIndex)
        );
      } else {
        updatedActiveSemesters.push({ classIndex, semesterIndex });
      }
      setActiveSemesters(updatedActiveSemesters);
    } else {
      // handle expanding/collapsing test collapsible
      let updatedActiveTests = [...activeTests];
      const testIsActive = updatedActiveTests.some(
        test => test.classIndex === classIndex && test.semesterIndex === semesterIndex && test.testIndex === testIndex
      );
      if (testIsActive) {
        updatedActiveTests = updatedActiveTests.filter(
          test => !(test.classIndex === classIndex && test.semesterIndex === semesterIndex && test.testIndex === testIndex)
        );
      } else {
        updatedActiveTests.push({ classIndex, semesterIndex, testIndex });
      }
      setActiveTests(updatedActiveTests);
    }
  };
  return (
    isLoading ? (
      <View style={{ flex: 1 }}>
         <Header></Header>
         <ActivityIndicator size={100} color='#9A9DBE'/>
        </View>
        
      ):(
    classificacoes && 
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
      
      {Object.keys(classificacoes).map((className, index) => (
  <View key={index}>
    <Pressable onPress={() => toggleExpanded(index)} style={{backgroundColor:'#778ca3',padding:10,marginTop:10,borderRadius:10}}>
      <Text style={[global.h3,{color:'white'}]}>{className}</Text>
    </Pressable>
    <Collapsible collapsed={!activeSections.includes(index)}>
      {Object.keys(classificacoes[className]).map((semesterName, semesterIndex) => (
        <View style={{marginTop:10}} key={semesterIndex}>
          <Pressable onPress={() => toggleExpanded(index, semesterIndex)} style={{backgroundColor:'#7BAAA6',padding:10,borderRadius:10,marginTop:5}}>
            <Text style={[global.h3,{color:'white'}]}>{semesterName}</Text>
          </Pressable>
          <Collapsible
            collapsed={
              !activeSemesters.some(
                semester => semester.classIndex === index && semester.semesterIndex === semesterIndex
              )
            }
          >
            {classificacoes[className][semesterName].map((test, testIndex) => (
              <View key={testIndex} >
                <Pressable onPress={() => [toggleExpanded(index, semesterIndex, testIndex)]} style={{backgroundColor:'#9abebb',padding:10,borderTopLeftRadius:10,borderTopRightRadius:10,marginTop:5}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between'}} ><Text style={[global.h3,{color:'white',fontSize:16}]} >{test.DtaAv}</Text>
                  <Text style={[global.h3,{color:'white',fontSize:16}]} >{test.Nota}</Text>
                  </View>
                  
                </Pressable>
                <Collapsible
                  collapsed={
                    !activeTests.some(
                      test => test.classIndex === index && test.semesterIndex === semesterIndex && test.testIndex === testIndex
                    )
                  }
                >
                  <View style={{backgroundColor:'white',marginBottom:10,borderBottomLeftRadius:10,borderBottomRightRadius:10,padding:10}}>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                      <Text style={[global.p,{fontWeight:'bold'}]}>Tipo: </Text>
                      <Text style={[global.p]}>{test.Tipo}</Text>
                    </View>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                      <Text style={[global.p,{fontWeight:'bold'}]}>Peso: </Text>
                      <Text style={[global.p]}>{test.Peso}</Text>
                    </View>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                      <Text style={[global.p,{fontWeight:'bold'}]}>Escala: </Text>
                      <Text style={[global.p]}>{test.Escala}</Text>
                    </View>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                      <Text style={[global.p,{fontWeight:'bold'}]}>Nota: </Text>
                      <Text style={[global.p]}>{test.Nota}</Text>
                    </View>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                      <Text style={[global.p,{fontWeight:'bold'}]}>Professor: </Text>
                      <Text style={[global.p]}>{test.Professor}</Text>
                    </View>
                  </View>
                </Collapsible>
              </View>
            ))}
          </Collapsible>
        </View>
      ))}
    </Collapsible>
  </View>
))}
    </View>
    
    </ScrollView>
    </ScrollView>
    </View>
  )
  )
};

export default Classificacoes;

const styles = StyleSheet.create({
  container: {
    paddingVertical: '2%',
    paddingHorizontal: '3%',
    height: '100%',
  },
});