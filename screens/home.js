import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList, ScrollView, Button,RefreshControl, ActivityIndicator } from 'react-native'
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import EventItem from '../components/EventItem';
import AgendaItem from '../components/AgendaItem';
import { useState } from 'react';
import { global } from "../styles/globals";
import firebase from 'firebase/app';
import { database } from '../firebase';
import 'firebase/database';
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import EmentaItem from '../components/EmentaItem';
import moment from 'moment/moment';
import ErrorModal from '../components/ErrorModal';

export default function Home({ navigation, isLoggedIn, setIsLoggedIn }) {

  const [eventos, setEventos] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [message,setMessage] = useState('')
  const [ementaData, setEmentaData] = useState(null);
  const [ementa, setEmenta] = useState([]);
  const [cantinaHorario, setCantinaHorario] = useState();
 const [isLoading,setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [agendaP, setAgendaP] = useState([])
  const [nomeUtil,setNomeUtil] = useState('');
  const [isModalVisible,setIsModalVisible] = useState(false)
   const [isConnected, setIsConnected] = useState();
  const today = new Date().toISOString().split('T')[0];
  const [refreshing, setRefreshing] = useState(false);
  const tk = 'Y-WywHe6uXAVa9z9yfUZVfEuODDRzbftZ-0JylWY0kqb46MXL9FYloflIO5vnj4vPS1V3hJ4aP0YasupkgI0FdpvYBt9PCcGDdd5lbGazugYZWvy0YiPPdCeuYkJS5Wr5JRZEC3jye8r3LXQSM3QM673d-uXXbeL_VmWrd8NGa3LlcRonsgqT6aNLoRcqpSZBNQBkRTc1e2g-NU82g4b-7bNDU1sJyp0KuiBVHggwO9dH5kOwAa3rN1oivBW0jtedDeYNEQe8QAMYWxGXviIg3X9TIbzPX7dSt759rJtK92ecqd8e60bRyTOcOUMhD8z';
  useEffect(() => {
    const handleConnectionChange = async (isConnected) => {
      if (isConnected) {
        
        const nomeUtil = await AsyncStorage.getItem('nomeUtil')
        
       
        const deletedEvents = await AsyncStorage.getItem('deletedEvents');
        const parsedDeletedEvents = deletedEvents ? JSON.parse(deletedEvents) : [];
        parsedDeletedEvents.forEach(id => {
          firebase.database().ref(`users/${nomeUtil}/eventsP/${id}`).remove()
        });
        await AsyncStorage.removeItem('deletedEvents');
 
        const dbRef = firebase.database().ref(`users/${nomeUtil}/eventsP`);
        const newEvents = await AsyncStorage.getItem('newEvents');
        const parsedNewEvents = newEvents ? JSON.parse(newEvents) : [];
        parsedNewEvents.forEach(event => {
          const newEventRef = dbRef.child(event.id);
          newEventRef.set(event);
        });
        await AsyncStorage.removeItem('newEvents');

        const editedEvents = await AsyncStorage.getItem('editedEvents');
        
       
        const parsedEditedEvents = editedEvents ? JSON.parse(editedEvents) : [];
        await Promise.all(parsedEditedEvents.map(async (event) => {
         
          const editedEventsRef = dbRef.child(event.id);
          const snapshot = await editedEventsRef.once('value');
          if (snapshot.exists()) {
            editedEventsRef.update(event);
          } else {
            editedEventsRef.set(event);
          }
        }));
        await AsyncStorage.removeItem('editedEvents');
      }
    };
  
    // Subscribe to network connection state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectionChange(state.isConnected);
    });
  
    return () => {
      // Unsubscribe from network connection state changes
      unsubscribe();
    };
  }, [isConnected]);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    if(!isConnected){
    const asyncLoadData = async () => {
      const storedAgendaP = await AsyncStorage.getItem('eventPHome');
      if (storedAgendaP) {
        setAgendaP(JSON.parse(storedAgendaP));
      }
    };
  
    asyncLoadData();
  
    const intervalId = setInterval(asyncLoadData, 2000); // check AsyncStorage every 5 seconds
    return () => {
      clearInterval(intervalId);
      
    };
    }
    return () => {
      
      unsubscribe();
    };
  }, []);
  
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

  async function loadDataFromStorage() {
    
    const agendaData = await AsyncStorage.getItem('eventsHome');
    const usernameData = await AsyncStorage.getItem('usernameHome');
    const agendaPData = await AsyncStorage.getItem('eventPHome')
    const ementaData = await AsyncStorage.getItem('ementaHome')
    const cantinaHorario = await AsyncStorage.getItem('cantinahorario')
    const eventos = await AsyncStorage.getItem('eventos')
    if (agendaData !== null) {
      setAgenda(JSON.parse(agendaData));

    }
    if (usernameData !== null) {
      setUsername(usernameData);
    }
   
    if (agendaPData !== null) {
      setAgendaP(JSON.parse(agendaPData));
    }
    if (ementa !== null) {
      setEmenta(JSON.parse(ementaData));
    }
    if (ementa !== null) {
      setEmenta(JSON.parse(ementaData));
    }
    if (cantinaHorario !== null) {
      setCantinaHorario(JSON.parse(cantinaHorario));
    }
    if(eventos !== null){
      setEventos(JSON.parse(eventos));
    }
   
  }
  useEffect(() => {
   
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(isConnected);
      setIsConnected(state.isConnected);

    });
    
    if (isConnected) {
      const getData = async () => {
        const nomeUtil = await AsyncStorage.getItem('nomeUtil');
        const ano = await AsyncStorage.getItem('ano');
        const turma = await AsyncStorage.getItem('turma');
        setNomeUtil(nomeUtil);
        const dbRef3 = firebase.database().ref(`users/${nomeUtil}/info`);
    
        dbRef3.on('value', (snapshot) => {
          const data = snapshot.val();
          if (data && data.NomeAbrev) {
            setUsername(data.NomeAbrev);
          }
        });
         
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
  };
        async function fetchEmentaHome() {
          const parser = new XMLParser();
        
          const today = new Date();
          const currentDate = formatDate(today);
        
          const details = {
            'tk': tk,
            'dt1': currentDate,
            'dt2': currentDate,
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
          setEmenta(data);
          AsyncStorage.setItem('ementaHome', JSON.stringify(data));
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
        
        fetchEmentaHome();
        const dbRef2 = firebase.database().ref(`users/${nomeUtil}/eventsP`);
        const dbRef = firebase.database().ref(`users/${nomeUtil}/events`);
        const dbRef4 = firebase.database().ref('/eventos');
      dbRef4.on('value', snapshot => {
        setEventos(snapshot.val());
        AsyncStorage.setItem('eventos',JSON.stringify(snapshot.val()))
      });

    
    
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 16);
        futureDate.setHours(0, 0, 0, 0);
        
    
        dbRef.on('value', (snapshot) => {
          const data = snapshot.val();
          const eventsArray = [];
          for (let key in data) {
            const eventDate = new Date(data[key].DtaIni);
            if (
              eventDate >= currentDate &&
              eventDate <= futureDate &&
              data[key].Tipo !== 'I'
            ) {
              eventsArray.push(data[key]);
            }
          }
          setAgenda(eventsArray);
          AsyncStorage.setItem('eventsHome', JSON.stringify(eventsArray));
        });
    
        dbRef2.on('value', (snapshot) => {
          const data = snapshot.val();
          const eventsPArray = [];
          for (let key in data) {
            const eventDate = new Date(data[key].DtaIni);
            if (
              eventDate >= currentDate &&
              eventDate <= futureDate &&
              data[key].Tipo !== 'I' && 
              data[key].Tipo !== 'F'
            ) {
              eventsPArray.push(data[key]);
            }
          }
          if (eventsPArray.length > 0) {
            setAgendaP(eventsPArray);
            AsyncStorage.setItem('eventPHome', JSON.stringify(eventsPArray));
          } else {
            setAgendaP([]);
            AsyncStorage.removeItem('eventPHome');
          }
        });
        setIsLoading(false);
      };
      setTimeout(getData, 1500);
    }
    
    else{
      loadDataFromStorage();
      setIsLoading(false)
    }
loadDataFromStorage();
      return () => {
        unsubscribeNetInfo();
      };
  }, [isConnected,refreshing]);
 
 
 
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

  const onRefresh = () => {
    setRefreshing(true);
    if(isConnected){
      handleSync();

    }
    
    // Call a function to fetch new data here
    wait(2000).then(() => setRefreshing(false));
  };




  return (
    isLoading ? (
      <View style={{ flex: 1 }}>
         <Header></Header>
         <ActivityIndicator size={100} color='#9A9DBE'/>
        </View>
        
      ):(
        <View style={{ flex: 1 }}>



      <Header></Header>
      <ErrorModal visible={isModalVisible} message={message} onClose={() => setIsModalVisible(false)} ></ErrorModal>
      <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.title}>
            <View style={{flexDirection: 'row',alignItems:'center'}}>

            <Text style={global.h1}>Bem vindo,</Text>{!isConnected && ( 
            <TouchableOpacity onPress={() => [setIsModalVisible(true),setMessage('A aplicação está em modo offline, mas não te preocupes, grande parte das funcionalidades continuam a funcionar! Tu continuas a poder ver a tua agenda, ementa e informações, criar, editar e apagar eventos pessoais.')]}>
              <Icon style={{marginLeft:120}}name="wifi-off" size={30} color={'#1E1E1E'}></Icon>
              </TouchableOpacity>
            )}
            </View>
            <Text style={global.p}>{username}</Text>
          </View>

          <Text style={[{ marginTop: 10 }, global.h2]}>Agenda</Text>
          {agenda.length === 0 && agendaP.length === 0 ?
            <Text style={[{ marginTop: 10 }, global.p]}>Não tens itens na agenda</Text>

            : <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              contentContainerStyle={[styles.eventos, { flexDirection: "row" }]}
              data={[...agenda, ...agendaP].sort((a, b) => {
                if (a.DtaIni && b.DtaIni) {
                  return a.DtaIni.localeCompare(b.DtaIni);
                } else {
                  return 0;
                }
              })}
              renderItem={({ item }) => (
                <AgendaItem agenda={item} navigation={navigation} />
              )}
            />
          }
          <Text style={[{ marginTop: 30 }, global.h2]}>Eventos</Text>
           {eventos.length === 0 ?  
          <Text style={[{ marginTop: 10 }, global.p]}>Não existem eventos marcados</Text>
           : <FlatList

          showsHorizontalScrollIndicator={false}
          horizontal={true}
          contentContainerStyle={[styles.eventos, { flexDirection: "row" }]}
          data={eventos}
          renderItem={({ item }) => (
            <EventItem eventos={item} />
          )} />

        } 
         {!ementa ? (
        <View style={{ height: 80 ,
          width: '100%',
          backgroundColor: '#D0247A',
          justifyContent:'center',
          alignItems:'center',
          borderRadius: 10,
          marginTop: 20,
         }}>
        <Text style={[global.h3,{color:'white'}]}>Não há almoço hoje</Text>
        </View>
         )
        :(<EmentaItem ementa={ementa} ></EmentaItem>)
}
      
         



        </View>
      </ScrollView>
      </ScrollView>
    </View>

      )
    
  )
}

const styles = StyleSheet.create({
  title: {
    marginTop:10,
    marginBottom: 20
  },
  QuickNav: {
    marginTop: 10,
    marginBottom: 10,
    opacity: 1,
    alignItems: 'center'

  },
  container: {
    paddingHorizontal: 18,
    flexGrow: 1,
  },
  eventos: {

    opacity: 1,
    alignItems: 'center'

  },
  QuickNavModal: {
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 25

  },
  buttonClose: {
    alignSelf: 'center'


  },
  
});