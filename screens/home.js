import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList, ScrollView, Button } from 'react-native'
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import EventItem from '../components/EventItem';
import AgendaItem from '../components/AgendaItem';
import { useState } from 'react';
import { global } from "../styles/globals";
import { auth } from '../firebase';
import { database } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import EmentaItem from '../components/EmentaItem';
import moment from 'moment/moment';

export default function Home({ navigation, isLoggedIn, setIsLoggedIn }) {

  const [item, setItem] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [ementa, setEmenta] = useState([]);
  const [cantinaHorario, setCantinaHorario] = useState();
  const uid = auth.currentUser.uid
  const [username, setUsername] = useState('');
  const [turma, setTurma] = useState('');
  const userRef = database.collection('users').doc(uid);
  const eventosRef = database.collection('eventos');
  const agendaRef = database.collection('agenda');
  const ementaRef = database.collection('ementa');
  const agendaPRef = database.collection('users').doc(uid).collection('agendaP')
  const [agendaP, setAgendaP] = useState([])
  const cantinaHorarioRef = database.collection('cantinahorario');
  const [isConnected, setIsConnected] = useState();
  const [changes,setChanges] = useState();
  const [loaded, setLoaded] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  useEffect(() => {
    const handleConnectionChange = async (isConnected) => {
      if (isConnected) {
        // Delete events that were deleted while offline
        const deletedEvents = await AsyncStorage.getItem('deletedEvents');
        const parsedDeletedEvents = deletedEvents ? JSON.parse(deletedEvents) : [];
        parsedDeletedEvents.forEach(id => {
          agendaPRef.doc(id).delete();
        });
        await AsyncStorage.removeItem('deletedEvents');
  
        // Update events that were edited while offline
        const editedEvents = await AsyncStorage.getItem('editedEvents');
        const parsedEditedEvents = editedEvents ? JSON.parse(editedEvents) : [];
        parsedEditedEvents.forEach(event => {
          agendaPRef.doc(event.id).update({
            titulo: event.titulo
          });
        });
        await AsyncStorage.removeItem('editedEvents');
  
        // Add new events that were added while offline
        const newEvents = await AsyncStorage.getItem('newEvents');
        const parsedNewEvents = newEvents ? JSON.parse(newEvents) : [];
        parsedNewEvents.forEach(event => {
          agendaPRef.doc(event.id).set(event);
        });
        await AsyncStorage.removeItem('newEvents');
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
  }, []);
  
  useEffect(() => {
    if(!isConnected){
      const loadDataFromStorage = async () => {
        const storedAgendaP = await AsyncStorage.getItem('agendaP');
        if (storedAgendaP) {
          setAgendaP(JSON.parse(storedAgendaP));
        }
      };
      loadDataFromStorage();

    }
   
  }, []);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    if(!isConnected){
    const asyncLoadData = async () => {
      const storedAgendaP = await AsyncStorage.getItem('agendaP');
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
    const eventosData = await AsyncStorage.getItem('eventos');
    const agendaData = await AsyncStorage.getItem('agenda');
    const usernameData = await AsyncStorage.getItem('username');
    const ementaData = await AsyncStorage.getItem('ementa');
    const agendaPData = await AsyncStorage.getItem('agendaP')
    const cantinaHorarioData = await AsyncStorage.getItem('cantinaHorario')
    console.log("ementadata",ementaData)
    
    if (eventosData !== null) {
      setEventos(JSON.parse(eventosData));
    }
    if (agendaData !== null) {
      setAgenda(JSON.parse(agendaData));

    }
    if (usernameData !== null) {
      setUsername(usernameData);
    }
    if (ementaData !== null) {
      setEmenta(JSON.parse(ementaData));
      
    }
    if (agendaPData !== null) {
      setAgendaP(JSON.parse(agendaPData));
    }
    if(cantinaHorario !== null){
      setCantinaHorario(JSON.parse(cantinaHorarioData));
    }
  }
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);

    });
    
    console.log("correu")
    loadDataFromStorage();
    if(isConnected){
      agendaPRef
      .onSnapshot((agendaDoc) => {
        const agendaP = []
        agendaDoc.forEach((document) => {
          const titulo = document.data().titulo;
          const data = document.data().data;
          const id = document.data().id;
          agendaP.push({ data: data, titulo, id });
        });
       

        if (agendaP.length > 0) {
          console.log(agendaP.length)
          setAgendaP(agendaP);
          AsyncStorage.setItem('agendaP', JSON.stringify(agendaP));
        }
        else {
          setAgendaP([]);
          AsyncStorage.removeItem('agendaP');
        }
      })
    eventosRef.onSnapshot((querySnapshot) => {
      const eventos = [];
      querySnapshot.forEach((documentSnapshot) => {
        eventos.push(documentSnapshot.data());
      });
      if (eventos.length > 0) {
        setEventos(eventos);
        AsyncStorage.setItem('eventos', JSON.stringify(eventos));
      }
      else {
        setEventos([]);
        AsyncStorage.removeItem('eventos');
      }
    });

   ementaRef.onSnapshot((querySnapshot) => {
      const ementa = [];
      querySnapshot.forEach((documentSnapshot) => {
        ementa.push(documentSnapshot.data() );
      });
      if (ementa.length > 0) {
        setEmenta(ementa);
        AsyncStorage.setItem('ementa', JSON.stringify(ementa));
      }
      else{
        setEmenta([]);
        AsyncStorage.removeItem('ementa');
      }
    });

    userRef.onSnapshot((doc) => {
      if (doc.exists) {
        const username = doc.data().nome;
        const turma = doc.data().turma;
        setTurma(turma);
        setUsername(username);
        AsyncStorage.setItem('turma', turma);
        AsyncStorage.setItem('username', username);
        if (turma) {
          agendaRef.doc(turma).collection('agenda')
            .onSnapshot((agendaDoc) => {
              const agenda = []
              agendaDoc.forEach((document) => {
                const titulo = document.data().titulo;
                const data = document.data().data;
                agenda.push({ data: data, titulo });
              });
              setAgenda(agenda);
              if (agenda.length > 0) {
                AsyncStorage.setItem('agenda', JSON.stringify(agenda));
              } else {
                setAgenda([]);
                AsyncStorage.removeItem('agenda');
              }
            })

        }
      } else {
        console.log('No user document found with ID:', uid);
      }
    });
    const dayOfWeek = moment().locale('pt').format('dddd');
    console.log(dayOfWeek)
    const cantinaHorarioRef = database.collection('cantinahorario').doc(dayOfWeek);
      cantinaHorarioRef.onSnapshot((doc) => {
        if (doc.exists) {
          const { '12IG': cantinaHorario } = doc.data();
          setCantinaHorario(cantinaHorario);
          console.log(cantinaHorario)
          AsyncStorage.setItem('cantinaHorario', JSON.stringify(cantinaHorario));
        } else {
          console.log("No such document");
        }
      });


    console.log('database loaded');
  

    }
      

    return () => {
      unsubscribeNetInfo();
     
    };
  }, [isConnected,changes]);

 
  const handleSignOut = () => {
    auth.signOut()
    setIsLoggedIn(false)
  }


  return (

    <View style={{ flex: 1 }}>



      <Header></Header>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.title}>

            <Text style={global.h1}>Bem vindo,</Text>
            <Text style={global.p}>{username}</Text>
          </View>

          <Text style={[{ marginTop: 10 }, global.h2]}>Agenda</Text>
          {agenda.length === 0 && agendaP.length === 0 ?
            <Text style={[{ marginTop: 10 }, global.p]}>Não tens itens na agenda</Text>

            : <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              contentContainerStyle={[styles.eventos, { flexDirection: "row" }]}
              data={[...agenda, ...agendaP].sort((a, b) => a.data.localeCompare(b.data))}
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
        {!cantinaHorario ? 
        <View style={{ height: 80 ,
          width: '100%',
          backgroundColor: '#D0247A',
          justifyContent: 'center',
          alignItems:'center',
          borderRadius: 10,
          marginTop: 20,
          zIndex: 2,
          paddingVertical: 6,}}>
        <Text style={[global.h3,{color:'white'}]}>Não há almoço hoje</Text>
        </View>
        :<EmentaItem ementa={ementa} cantinaHorario={cantinaHorario}></EmentaItem>
      }
          
          <TouchableOpacity style={{ marginTop: 30 }} onPress={handleSignOut} ><Text style={global.h2}>Sign out</Text></TouchableOpacity>



        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
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
    flexGrow: 1,            // all the available vertical space will be occupied by it
    justifyContent: 'space-between',
    padding: 25

  },
  buttonClose: {
    alignSelf: 'center'


  },
  
});