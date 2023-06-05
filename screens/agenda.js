import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { Text, View, Modal, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput,RefreshControl,ActivityIndicator,Button,Switch } from 'react-native';
import { Calendar, LocaleConfig, CalendarList } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { global } from "../styles/globals";
import firebase from 'firebase/app';
import { database } from '../firebase';
import 'firebase/database';
import moment from 'moment/moment';
import EventPList from '../components/EventPList';
import EventList from '../components/EventList';
import { useIsFocused } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import ErrorModal from '../components/ErrorModal';
import { useToast } from "react-native-toast-notifications";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import RNCalendarEvents from "react-native-calendar-events";
import AlertPreferenceModal from '../components/AlertPrefrenceModal';
import Icon from 'react-native-vector-icons/Ionicons';
WebBrowser.maybeCompleteAuthSession();
const AgendaScreen = React.memo(({route}) => {
  const isFocused = useIsFocused();
  const {runFunction, selectedClickDate} = route.params
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal2Visible, setIsModal2Visible] = useState(false);
  const [isModal3Visible, setIsModal3Visible] = useState(false);
  const [isModal4Visible, setIsModal4Visible] = useState(false);
  const [turma, setTurma] = useState('');
  const [eventDates, setEventDates] = useState([]);
  const [nomeUtil,setNomeUtil] = useState('');
  const [eventPDates, setPEventDates] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const today = new Date().toISOString().split('T')[0]; // get today's date in ISO format
  const modalPosition = React.useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const [errorMessage,setErrorMessage] = useState('');
  const [isLoading,setIsLoading] = useState(true)

  useEffect(() => {
    const handleConnectionChange = async (isConnected) => {
      if (isConnected) {
        const nomeUtil = await AsyncStorage.getItem('nomeUtil')
        // Delete events that were deleted while offline
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
          const newEventRef = dbRef.child(event.idDb);
          newEventRef.set(event);
        });
        await AsyncStorage.removeItem('newEvents');

        const editedEvents = await AsyncStorage.getItem('editedEvents');
        
       
        const parsedEditedEvents = editedEvents ? JSON.parse(editedEvents) : [];
        await Promise.all(parsedEditedEvents.map(async (event) => {
         
          const editedEventsRef = dbRef.child(event.idDb);
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
  const API_URL = 'https://geweb3.cic.pt/GEWebApi/token';
  const handleSync = async () => {
    setIsLoading(true);
    
    const username = await AsyncStorage.getItem('username');
    const password = await AsyncStorage.getItem('password');
  
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
  const createCalendarEvents = async (events) => {
    // get alertPreference from AsyncStorage
    const alertPreference = await AsyncStorage.getItem('alertPreference');
  
    for (const event of events) {
      const { Titulo, DtaIni, Tipo } = event;
      if (Tipo != 'F' && Tipo != 'I') {
        const startDate = new Date(DtaIni);
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 1 day later
        
       
        let alarmDate;
  
        if (alertPreference === 'A') {
          alarmDate = new Date(startDate);
        } else if (alertPreference === 'B') {
          alarmDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
        } else if (alertPreference === 'C') {
          alarmDate = new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days before
        } else if (!alertPreference) {
          alarmDate = new Date(startDate);
        }
        alarmDate.setHours(9, 0, 0, 0);
  
        const minutesBefore = (alarmDate.getTime() - startDate.getTime()) / (60 * 1000);
  
        const alarm = Platform.OS === 'ios' ? alarmDate.toISOString() : -minutesBefore;
  
        try {
          const eventId = await RNCalendarEvents.saveEvent(Titulo, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            allDay: true,
            alarms: [
              {
                date: alarm,
              },
            ],
            description: 'CIC',
          });
          event.id = eventId;
        } catch (error) {
          console.error(error);
        }
      }
    }
  };
  const deleteCalendarEvents = async () => {
    try {
      const startDate = new Date(0); // 1970-01-01
      const endDate = new Date(); // today
      endDate.setFullYear(endDate.getFullYear() + 10); // 10 years from now
  
      const events = await RNCalendarEvents.fetchAllEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );
      for (const event of events) {
        if (event.description === 'CIC') {
          try {
            await RNCalendarEvents.removeEvent(event.id);
          } catch (error) {
            console.error(error);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const getEvents = async (token) => {
    // delete previous calendar events
    await deleteCalendarEvents();
  
    const response = await fetch('https://geweb3.cic.pt/GEWebApi/api/event', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (response.ok) {
      const dataResponse = await response.json();
      const events = dataResponse.map(({ Titulo, Tipo, DtaIni }) => ({
        Titulo,
        Tipo,
        DtaIni: DtaIni.split('T')[0],
      }));
  
      // create new calendar events
      await createCalendarEvents(events);
  
      // store events in AsyncStorage
      await AsyncStorage.setItem('events', JSON.stringify(events));
  
      return events;
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

  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

    const onRefresh = () => {
      setRefreshing(true);
      if(isConnected){
        handleSync();
      }
     
      wait(2000).then(() => setRefreshing(false));
    };
  
const currentDate = moment().format("YYYY-MM-DD");
  const [isConnected, setIsConnected] = useState();
 
 
  
  const noEventsMessage = selectedDate === today
    ? 'Não tens nada agendado para hoje'
    : 'Não tens nada agendado para este dia';
  const noEventsMessage2 = selectedDate === today
    ? 'Não tens nada pessoal agendado para hoje'
    : 'Não tens nada pessoal agendado para este dia';

    useEffect(() => {
      if (isFocused && runFunction) {
        
        
        setSelectedDate(selectedClickDate)
      }
    }, [isFocused]);
    useEffect(() => {
      if(!runFunction){
        
        setSelectedDate(currentDate)
      }

    },[])
    
  async function loadDataFromStorage() {
    const agendaData = await AsyncStorage.getItem('events');
    const turmaData = await AsyncStorage.getItem('turma');
    const agendaPData = await AsyncStorage.getItem('eventP');
    
    
    setTurma(turmaData);
   
    if (agendaData !== null) {
      setEventDates(JSON.parse(agendaData));
      

    }
   

  }


  useEffect(() => {
   
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      
      setIsConnected(state.isConnected);

    });
    
    if(isConnected){
    
    const getDataAgenda = async () => {
      const nomeUtil = await AsyncStorage.getItem('nomeUtil')
      setNomeUtil(nomeUtil);
      const dbRef = firebase.database().ref(`users/${nomeUtil}/events`);
  dbRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const eventsArray = [];
    for (let key in data) {
      eventsArray.push(data[key]);
    }
    setEventDates(eventsArray);
    
    AsyncStorage.setItem('events',JSON.stringify(eventsArray))
    
    
  });
  
  const dbRef2 = firebase.database().ref(`users/${nomeUtil}/eventsP`);
  const getCalendarEvents = async () => {
    try {
      const startDate = new Date(0); // 1970-01-01
      const endDate = new Date(); // today
      endDate.setFullYear(endDate.getFullYear() + 10); // 10 years from now
  
      const events = await RNCalendarEvents.fetchAllEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );
      const cicPessoalEvents = events.filter(event => event.description === 'CIC pessoal');
      const formattedEvents = cicPessoalEvents.map(event => ({
        Titulo: event.title,
        DtaIni: event.startDate.split('T')[0], // YYYY-MM-DD format
        id: event.id,
        idDb: 'some value',
      }));
      return formattedEvents;
    } catch (error) {
      console.error(error);
    }
  };
  const calendarEventP = await getCalendarEvents();

  setPEventDates(calendarEventP)
  setIsLoading(false);
}
  getDataAgenda()
    }
    
else{
  setIsLoading(false);
}

loadDataFromStorage();
      return () => {
        unsubscribeNetInfo();
      };
  }, [isConnected,refreshing,isLoading]);
  
  const onDayPress = useCallback((day) => {
    setSelectedDate(day.dateString);
  }, []);


  LocaleConfig.locales['pt'] = {
    monthNames: [
      'JANEIRO',
      'FEVEREIRO',
      'MARÇO',
      'ABRIL',
      'MAIO',
      'JUNHO',
      'JULHO',
      'AGOSTO',
      'SETEMBRO',
      'OUTUBRO',
      'NOVEMBRO',
      'DEZEMBRO',
    ],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    dayNames: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'Hoje',

  };
  LocaleConfig.defaultLocale = 'pt';

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const submitEvent = async () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
  
    if (newEvent.length > 2 && newEvent.length < 20) {
      const existingEvents = await AsyncStorage.getItem('eventP');
      const eventP = existingEvents ? JSON.parse(existingEvents) : [];
  
      const dbRef = firebase.database().ref(`users/${nomeUtil}/eventsP`);
      const newEventRef = dbRef.push();
      
      const startDate = new Date(selectedDate);
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 1 day later
      const alertPreference = await AsyncStorage.getItem('alertPreference');
      let alarmDate;
  
      if (alertPreference === 'A') {
        alarmDate = new Date(startDate);
      } else if (alertPreference === 'B') {
        alarmDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
      } else if (alertPreference === 'C') {
        alarmDate = new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days before
      } else if (!alertPreference) {
        alarmDate = new Date(startDate);
      }
      alarmDate.setHours(9, 0, 0, 0);

      const minutesBefore = (alarmDate.getTime() - startDate.getTime()) / (60 * 1000);

      const alarm = Platform.OS === 'ios' ? alarmDate.toISOString() : -minutesBefore;
      toast.show('esta tarefa pode demorar alguns segundos', {
        type: "warning",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
      })
        const eventId = await RNCalendarEvents.saveEvent(newEvent, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          allDay: true,
          alarms: [
            {
              date: alarm,
            },
          ],
          description:'CIC pessoal',
          recurrence:recurrence,
        });
        setAlertRecurrence('none')
        setIsEnabled(false);
        
        
  
          const eventPData = {
            Titulo: newEvent,
            DtaIni: selectedDate,
            id: eventId,
            idDb: newEventRef.key,
          };
          const getCalendarEvents = async () => {
            try {
              const startDate = new Date(0); // 1970-01-01
              const endDate = new Date(); // today
              endDate.setFullYear(endDate.getFullYear() + 10); // 10 years from now
          
              const events = await RNCalendarEvents.fetchAllEvents(
                startDate.toISOString(),
                endDate.toISOString()
              );
              const cicPessoalEvents = events.filter(event => event.description === 'CIC pessoal');
              const formattedEvents = cicPessoalEvents.map(event => ({
                Titulo: event.title,
                DtaIni: event.startDate.split('T')[0], // YYYY-MM-DD format
                id: event.id,
                idDb: newEventRef.key.toString(),
              }));
              return formattedEvents;
            } catch (error) {
              console.error(error);
            }
          };
          const calendarEventP = await getCalendarEvents();
          setPEventDates(calendarEventP);
      if (!isConnected) {
        const newEvents = await AsyncStorage.getItem('newEvents');
        const parsedNewEvents = newEvents ? JSON.parse(newEvents) : [];
        parsedNewEvents.push(eventPData);
        await AsyncStorage.setItem('newEvents', JSON.stringify(parsedNewEvents));
  
        // Check if the event is today or within the next 15 days
        const currentDate = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);
        const eventDate = new Date(eventPData.DtaIni);
        if (eventDate >= currentDate && eventDate <= futureDate) {
          // Add the event to eventsHome
          const getEventsHome = await AsyncStorage.getItem('eventsHome');
          const parsedEventsHome = getEventsHome ? JSON.parse(getEventsHome) : [];
          const eventsHome = [...parsedEventsHome, eventPData];
          AsyncStorage.setItem('eventsHome', JSON.stringify(eventsHome));
        }
      } else {
        // calendarEventP.forEach((event) => {
        //   newEventRef.set(event);
        // });
      }
  
      AsyncStorage.setItem('eventP', JSON.stringify(eventP));
      toast.show('Evento criado', {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
      })
    } else {
      setIsModal2Visible(true);
      if (newEvent.length < 2) {
        setErrorMessage('O nome dado ao evento não tem caracteres suficientes');
      } else if (newEvent.length > 20) {
        setErrorMessage('O nome dado ao evento tem demasiado caracteres');
      }
    }
  };
  const markedDates = useMemo(() => {
    const allEventDates = [...eventDates, ...eventPDates];
    const markedDatesObj = allEventDates.reduce((obj, event) => {
      let color;
      let textColor;
      let startingDay;
      let endingDay;
      switch (event.Tipo) {
        case 'TST':
          color = '#778ca3';
          textColor = 'white';
          startingDay = true;
          endingDay = true;
          break;
        case 'F':
          const previousEventIndex = eventDates.indexOf(event) - 1;
          const nextEventIndex = eventDates.indexOf(event) + 1;
          if (
            previousEventIndex >= 0 &&
            nextEventIndex < eventDates.length &&
            eventDates[previousEventIndex].Tipo === 'I' &&
            eventDates[nextEventIndex].Tipo === 'I'
          ) {
            color = '#C7254E';
            textColor = 'white'
          } else {
            color='#C7254E'
            startingDay = true;
            endingDay = true;
          }
          break;
        case 'G':
          color = '#38ada9';
          textColor = 'white';
          startingDay = true;
          endingDay = true;
          break;
        case 'I':
          color = '#e55039';
          textColor = 'white';
          const eventsWithSameTitle = eventDates.filter(
            e => e.Tipo === 'I' && e.Titulo === event.Titulo
          );
          const minDate = eventsWithSameTitle.reduce(
            (minDate, e) => (e.DtaIni < minDate ? e.DtaIni : minDate),
            event.DtaIni
          );
          const maxDate = eventsWithSameTitle.reduce(
            (maxDate, e) => (e.DtaIni > maxDate ? e.DtaIni : maxDate),
            event.DtaIni
          );
          if (event.DtaIni === minDate) {
            startingDay = true;
          }
          if (event.DtaIni === maxDate) {
            endingDay = true;
          }
          break;
        default:
          color = '#9b59b6'
          startingDay = true;
          endingDay = true;
      }
  
      const isEventP = eventPDates.includes(event);
      obj[event.DtaIni] = {
        selected: true,
        title: event.Titulo,
        color: isEventP ? '#beac9a' : color,
        textColor,
        startingDay: isEventP ? true : startingDay,
        endingDay: isEventP ? true : endingDay,
      };
      return obj;
    }, {});
  
    if (selectedDate) {
      const today = new Date().toISOString().slice(0, 10);
      const existingTodayMarkedDateObj = markedDatesObj[today];
      if (existingTodayMarkedDateObj) {
        markedDatesObj[today] = {
          ...existingTodayMarkedDateObj,
          selected: true,
          color: '#CAD3C8',
          startingDay: true,
          endingDay: true,
        };
      } else {
        markedDatesObj[today] = {
          textColor: '#0984e3',
        };
      }
      const existingMarkedDateObj = markedDatesObj[selectedDate];
      markedDatesObj[selectedDate] = {
        ...existingMarkedDateObj,
        marked: true,
        dotColor:'#9abebb'
      };
    }
  
    return markedDatesObj;
  }, [eventDates, eventPDates, selectedDate]);
  const currentYear = moment().format('YYYY');
  const lastYear = moment().subtract(1, 'year').format('YYYY');

  const minDate = `${lastYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;
  const disabledMonths = {};

  const momentMinDate = moment(minDate);
  const momentMaxDate = moment(maxDate);

  moment.locale('en');
  for (
    let month = momentMinDate.clone();
    month.isBefore(momentMaxDate);
    month.add(1, 'month')
  ) {
    const monthString = month.format('YYYY-MM');
    if (month.isBefore(moment())) {
      disabledMonths[monthString] = { disabled: true };
    }
  }
///////////////////////////////////////

RNCalendarEvents.requestPermissions();
const [isEnabled, setIsEnabled] = useState(false);
const [recurrence, setAlertRecurrence] = useState('none');

  useEffect(() => {
    const getAlertRecurrence = async () => {
      setAlertRecurrence(recurrence);
    };
    getAlertRecurrence();
  }, []);

  const handleSelectRecurrence = async (recurrence) => {
    setAlertRecurrence(recurrence);
    setIsModal4Visible(false);
  };
const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  return (
!isLoading ? (
  <>
    
  <Modal
    animationType='fade'
    visible={isModalVisible}
    onRequestClose={() => setIsModalVisible(false)}
    transparent={true}
  >
    <View style={styles.modalContainer}>

      <View style={styles.modalContent}>
        <TouchableOpacity style={[styles.closeButton]} onPress={closeModal}>
          <Text style={global.p}>X</Text>
        </TouchableOpacity>
        <Text style={global.h2}>Criar evento</Text>
        <TextInput
          style={styles.input}
          placeholder="Titulo do evento"
          onChangeText={text => setNewEvent(text)}
          value={newEvent}
        />
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:10,justifyContent:'flex-start'}}>
          
      <Switch
        trackColor={{ false: '#767577', true: '#bdc3c7' }}
        thumbColor={isEnabled ? '#9abebb' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => {toggleSwitch(), !isEnabled && setIsModal4Visible(true) }}
        value={isEnabled}
      />
      <Text style={global.p}>Evento recorrente?</Text>
    </View><View style={{ flexDirection: 'row', justifyContent: 'space-around',alignItems:'flex-start' }}>
          
          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
            <Text style={[global.p, { color: '#9abebb' }]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={() => {
            submitEvent();
            closeModal();
          }}>

            <Text style={[global.p, { color: 'white' }]} >Criar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  </Modal>
  <Modal
    animationType='fade'
    visible={isModal4Visible}
    onRequestClose={() => setIsModal4Visible(false)}
    transparent={true}
  >
    <View style={styles.modalContainer}>

      <View style={styles.modalContent}>
      <TouchableOpacity style={[styles.closeButton]} onPress={() => setIsModal4Visible(false)}><Text>X</Text></TouchableOpacity>
      <Text style={global.h2}>Escolhe o tipo de recurrência</Text>
          <TouchableOpacity
            style={[
              styles.submitButton,{width:250,marginTop:10}
              
            ]}
            onPress={() => handleSelectRecurrence('daily')}
          >
            <Text style={[global.p, { color: 'white' }]}>Diária</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,{width:250,marginTop:10}
              
            ]}
            onPress={() => handleSelectRecurrence('weekly')}
          >
            <Text style={[global.p, { color: 'white' }]}>Semanal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,{width:250,marginTop:10}
              
            ]}
            onPress={() => handleSelectRecurrence('monthly')}
          >
            <Text style={[global.p, { color: 'white' }]}>Mensal</Text>
          </TouchableOpacity>
      </View>
    </View>
  </Modal>
 <ErrorModal visible={isModal2Visible} onClose={() => setIsModal2Visible(false)} message={errorMessage}></ErrorModal>

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
 <View style={{justifyContent:'flex-end',alignItems:'flex-end',marginRight:18}}>
  <TouchableOpacity onPress={() => setIsModal3Visible(true)}><Icon name="md-settings-outline" color={'#747d8c'} size={30}></Icon></TouchableOpacity>
 </View>
      <AlertPreferenceModal
        visible={isModal3Visible}
        onClose={() => setIsModal3Visible(false)}
      />
    <Calendar
      onDayPress={onDayPress}
      markingType={'period'}
      markedDates={markedDates}
      pagingEnabled={true}
      hideExtraDays={true}
      firstDay={1}
      minDate={minDate}
      maxDate={maxDate}
      theme={{
        backgroundColor: 'rgb(242,242,242)',
        calendarBackground: 'rgb(242,242,242)',
        textMonthFontFamily: 'sans-semibold',
        textMonthFontSize: 35,
        monthTextColor: '#1E1E1E',
      }}
      
    />

    <Text style={[global.h2, { marginLeft: 20, marginTop: 20, color: 'rgba(30, 30, 30, 0.63)' }]}> {selectedDate}</Text>
    <EventList
      events={eventDates}
      selectedDate={selectedDate}
      noEventsMessage={noEventsMessage}
    />
    <EventPList
      events={eventPDates}
      selectedDate={selectedDate}
      noEventsMessage={noEventsMessage2}
      isConnected={isConnected}
      onRefresh={onRefresh}
    />


    <View style={styles.addEvent}>
      <TouchableOpacity style={styles.circleButton} onPress={openModal}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
  </ScrollView>
</>

):(
  <View style={{flex: 1,
    justifyContent: 'center',
    alignItems: 'center',}}>
       <ActivityIndicator size={100} color='#9A9DBE'/>
        </View>
)
   
  );
});
const styles = StyleSheet.create({

  addEvent: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  circleButton: {
    backgroundColor: '#9abebb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: {
    color: 'white',
    fontSize: 24,

  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    elevation: 5,

  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#9abebb',
    padding: 5,
    width: 100,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',

  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth:1,
    borderColor:'#9abebb',
    padding: 5,
    width: 100,
    height: 50,
    marginRight: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButtonText: {
    color:'#9abebb',
  }, closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 25,
    height: 25,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }, button: {
    backgroundColor: '#4da6ff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedButton: {
    backgroundColor: '#ff9933',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});
export default AgendaScreen;  