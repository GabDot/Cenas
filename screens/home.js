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
        const dbRef = firebase.database().ref(`users/${nomeUtil}/events`);
        const dbRef2 = firebase.database().ref(`users/${nomeUtil}/eventsP`);
        const db = firebase.database();
        db.ref('/ementa').on('value', snapshot => {
          const data = snapshot.val();
          const filteredData = Object.values(data).find(dayData => {
            const date = moment(dayData.Dta, 'YYYY-M-D');
            return date.isSame(moment(), 'day');
          });
          if(filteredData){
            setEmenta(filteredData);
          AsyncStorage.setItem('ementaHome',JSON.stringify(filteredData))
          }
          else{
            setEmenta(null)
            AsyncStorage.removeItem('ementaHome')
          }
          
          
        });
      
        const day = new Date()
        const dayOfWeek = moment(day, 'YYYY-M-D').locale('pt-br').format('dddd')
       console.log(ano)
       console.log(turma)
       console.log(dayOfWeek)
        db.ref(`/cantinahorario/${ano}/${turma}/${dayOfWeek}`).on('value', snapshot => {
          setCantinaHorario(snapshot.val());
          AsyncStorage.setItem('cantinahorario',JSON.stringify(snapshot.val()))
        });
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
    // Call a function to fetch new data here
    wait(2000).then(() => setRefreshing(false));
  };




  return (
    isLoading ? (
      <View style={{ flex: 1 }}>
         <Header></Header>
         <ActivityIndicator size={100}></ActivityIndicator>
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
        :(<EmentaItem ementa={ementa} cantinaHorario={cantinaHorario}></EmentaItem>)
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