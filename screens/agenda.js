import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { Text, View, Modal, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput,RefreshControl } from 'react-native';
import { Calendar, LocaleConfig, CalendarList } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { global } from "../styles/globals";
import { database } from '../firebase';
import { auth } from '../firebase';
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
  const uid = auth.currentUser.uid
  const [turma, setTurma] = useState('');
  const agendaRef = database.collection('agenda');
  const [eventDates, setEventDates] = useState([]);
  const [eventPDates, setPEventDates] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const today = new Date().toISOString().split('T')[0]; // get today's date in ISO format
  const modalPosition = React.useRef(new Animated.Value(0)).current;
  const agendaPRef = database.collection('users').doc(uid).collection('agendaP')
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage,setErrorMessage] = useState('');

  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }
  
  
    
  
    const onRefresh = () => {
      setRefreshing(true);
      // Call a function to fetch new data here
      wait(2000).then(() => setRefreshing(false));
    };
  
const currentDate = moment().format("YYYY-MM-DD");
  const [isConnected, setIsConnected] = useState();
  function formatDate(timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  useEffect(() => {
    const loadDataFromStorage = async () => {
      const storedAgendaP = await AsyncStorage.getItem('agendaP');
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
      const storedAgendaP = await AsyncStorage.getItem('agendaP');
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
    const agendaData = await AsyncStorage.getItem('agenda');
    const turmaData = await AsyncStorage.getItem('turma');
    const agendaPData = await AsyncStorage.getItem('agendaP');
    setTurma(turmaData);

    if (agendaData !== null) {
      const parsedData = JSON.parse(agendaData)
       
    
      setEventDates(parsedData);
    }
    if (agendaPData !== null) {
      const parsedPData = JSON.parse(agendaPData);

      setPEventDates(parsedPData);
    }

  }


  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(isConnected);
      setIsConnected(state.isConnected);

    });
    loadDataFromStorage();

    if(isConnected){

      if (turma) {
        agendaRef.doc(turma).collection('agenda')
          .onSnapshot((agendaDoc) => {
            const agenda = []
            console.log("mudou")
            agendaDoc.forEach((document) => {
              const titulo = document.data().titulo;
              const data = document.data().data;
              agenda.push({ data: data, titulo });
            });
            setEventDates(agenda);

            if (agenda.length > 0) {
              AsyncStorage.setItem('agenda', JSON.stringify(agenda));

            }

          })
      }
      agendaPRef
        .onSnapshot((agendaDoc) => {
          const agendaP = []
          agendaDoc.forEach((document) => {
            const titulo = document.data().titulo;
            const data = document.data().data;
            const id = document.data().id;
            agendaP.push({ data: data, titulo, id });
          });
          setPEventDates(agendaP);

          if (agendaP.length > 0) {
            AsyncStorage.setItem('agendaP', JSON.stringify(agendaP));

          }

        })
      }
      return () => {
        unsubscribeNetInfo();
      };
  }, [isConnected,refreshing]);
  


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
  
    if (selectedDateObj.getTime() >= today && newEvent.length>3 && newEvent.length<20) {
      // Retrieve existing events from AsyncStorage
      const existingEvents = await AsyncStorage.getItem('agendaP');
      const eventP = existingEvents ? JSON.parse(existingEvents) : [];
  
      const eventPRef = agendaPRef.doc();
      const eventPData = {
        titulo: newEvent,
        data: selectedDate,
        id: eventPRef.id
      };
      eventP.push(eventPData);
      setPEventDates(eventP);
  
      // Check if the device is offline
      if (!isConnected) {
        // Store the new event in AsyncStorage
        const newEvents = await AsyncStorage.getItem('newEvents');
        const parsedNewEvents = newEvents ? JSON.parse(newEvents) : [];
        parsedNewEvents.push(eventPData);
        await AsyncStorage.setItem('newEvents', JSON.stringify(parsedNewEvents));
      } else {
        // Add the new event to the database
        eventPRef.set(eventPData);
      }
  
      AsyncStorage.setItem('agendaP', JSON.stringify(eventP));
    } else {
      setIsModal2Visible(true)
      if(selectedDateObj.getTime() <= today){
        setErrorMessage('Não é possível criar um evento pessoal para uma data no passado')
      }
      else if(newEvent.length<3 ){
        setErrorMessage('O nome dado ao evento não tem caracteres suficientes')
      }
      else if(newEvent.length>20 ){
        setErrorMessage('O nome dado ao evento tem demasiado caracteres')
      }

      
    }
  };



  const markedDates = useMemo(() => {
    const allDates = [...eventDates, ...eventPDates];
    const markedDatesObj = allDates.reduce((obj, date) => {
      obj[date.data] = {
        selected: true,
        title: date.titulo,
        color: 'blue',
      };
      return obj;
    }, {});

    if (selectedDate) {
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

        <Text style={[global.h2, { marginLeft: 20, marginTop: 20, color: 'rgba(30, 30, 30, 0.63)' }]}>{selectedDate}</Text>
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
        />


        <View style={styles.addEvent}>
          <TouchableOpacity style={styles.circleButton} onPress={openModal}>
            <Text style={styles.plus}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </ScrollView>
    </>
  );
});
const styles = StyleSheet.create({

  addEvent: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  circleButton: {
    backgroundColor: '#4B98A3',
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
    backgroundColor: '#337AB7',
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
    backgroundColor: '#C7254E',
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