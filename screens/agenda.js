import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { Text, View, Modal, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput,RefreshControl,ActivityIndicator } from 'react-native';
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
const AgendaScreen = React.memo(({route}) => {
  const isFocused = useIsFocused();
  const {runFunction, selectedClickDate} = route.params
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal2Visible, setIsModal2Visible] = useState(false);
  const [turma, setTurma] = useState('');
  const [eventDates, setEventDates] = useState([]);
  const [nomeUtil,setNomeUtil] = useState('');
  const [eventPDates, setPEventDates] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const today = new Date().toISOString().split('T')[0]; // get today's date in ISO format
  const modalPosition = React.useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
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
          const newEventRef = dbRef.child(event.id);
          newEventRef.set(event);
        });
        await AsyncStorage.removeItem('newEvents');

        const editedEvents = await AsyncStorage.getItem('editedEvents');
        
        console.log(`nomeUtil: ${nomeUtil}`);
        const parsedEditedEvents = editedEvents ? JSON.parse(editedEvents) : [];
        await Promise.all(parsedEditedEvents.map(async (event) => {
          console.log(`event.id: ${event.id}`);
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
  
  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

    const onRefresh = () => {
      setRefreshing(true);
      console.log("refreshing?")
      wait(2000).then(() => setRefreshing(false));
    };
  
const currentDate = moment().format("YYYY-MM-DD");
  const [isConnected, setIsConnected] = useState();
  useEffect(() => {
    const loadDataFromStorage = async () => {
      const storedAgendaP = await AsyncStorage.getItem('eventsP');
      if (storedAgendaP) {
        setPEventDates(JSON.parse(storedAgendaP));
      }
    };
    loadDataFromStorage();
  }, []);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
  
    const asyncLoadData = async () => {
       const storedAgendaP = await AsyncStorage.getItem('eventsP');
       if (storedAgendaP) {
         setPEventDates(JSON.parse(storedAgendaP));
       }
    };
  
    asyncLoadData();
  
    const intervalId = setInterval(asyncLoadData, 1000); 
  
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, []);
  
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
        console.log("ya")
        setSelectedDate(currentDate)
      }

    },[])
    
  async function loadDataFromStorage() {
    const agendaData = await AsyncStorage.getItem('events');
    const turmaData = await AsyncStorage.getItem('turma');
    const agendaPData = await AsyncStorage.getItem('eventP');
    console.log("agendapdata",agendaPData);
    console.log(eventPDates)
    
    setTurma(turmaData);
   
    if (agendaData !== null) {
      setEventDates(JSON.parse(agendaData));

    }
    if(agendaPData !== null){
      setPEventDates(JSON.parse(agendaPData));
    }
   

  }


  useEffect(() => {
   
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(isConnected);
      setIsConnected(state.isConnected);

    });
    
    if(isConnected){
    
    const getData = async () => {
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
  dbRef2.on('value', (snapshot) => {
    const data = snapshot.val();
    const eventsPArray = [];
    for (let key in data) {
      eventsPArray.push(data[key]);
    }
    if(eventsPArray.length>0){
      setPEventDates(eventsPArray);
      AsyncStorage.setItem('eventP',JSON.stringify(eventsPArray))
    }
    else{
      setPEventDates([]);
      AsyncStorage.removeItem('eventP')
    }
  });
  setIsLoading(false);
}
getData()
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
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
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
  
    if (selectedDateObj.getTime() >= today && newEvent.length > 3 && newEvent.length < 20) {
      const existingEvents = await AsyncStorage.getItem('eventP');
      const eventP = existingEvents ? JSON.parse(existingEvents) : [];
  
      const dbRef = firebase.database().ref(`users/${nomeUtil}/eventsP`);
      const newEventRef = dbRef.push();
      const eventPData = {
        Titulo: newEvent,
        DtaIni: selectedDate,
        id: newEventRef.key,
      };
      eventP.push(eventPData);
      setPEventDates(eventP);
  
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
        newEventRef.set(eventPData);
      }
  
      AsyncStorage.setItem('eventP', JSON.stringify(eventP));
    } else {
      setIsModal2Visible(true);
      if (selectedDateObj.getTime() <= today) {
        setErrorMessage('Não é possível criar um evento pessoal para uma data no passado');
      } else if (newEvent.length < 3) {
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
          color = '#4b6584';
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
        /><View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
            <Text style={[global.p, { color: 'white' }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={() => {
            submitEvent();
            closeModal();
          }}>

            <Text style={[global.p, { color: 'white' }]} >Save</Text>
          </TouchableOpacity>

        </View>
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
        textMonthFontFamily: 'sans-bold',
        textMonthFontSize: 36,
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
       <ActivityIndicator size={100} />
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
    marginVertical: 20,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#778ca3',
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
    backgroundColor: '#be9a9b',
    padding: 5,
    width: 100,
    height: 50,
    marginRight: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButtonText: {
    color: 'white'
  }, closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 25,
    height: 25,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
export default AgendaScreen;  