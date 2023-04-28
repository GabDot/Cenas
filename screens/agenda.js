import React, { useState, useEffect,useCallback,useMemo } from 'react';
import { Text, View, Modal, TouchableOpacity,StyleSheet,ScrollView,Animated,TextInput } from 'react-native';
import { Calendar,LocaleConfig,CalendarList } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { global } from "../styles/globals";
import { database } from '../firebase';
import { auth } from '../firebase';
import moment from 'moment/moment';
import EventPList from '../components/EventPList';
import EventList from '../components/EventList';
import NetInfo from '@react-native-community/netinfo';

const AgendaScreen = React.memo(() => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const uid = auth.currentUser.uid
  const [turma, setTurma] = useState('');
  const agendaRef = database.collection('agenda');
  const [eventDates, setEventDates] = useState([]);
  const [eventPDates, setPEventDates] = useState([]);
  const eventosRef = database.collection('eventos');
  const [agenda, setAgenda] = useState([]);
  const [newEvent,setNewEvent] = useState('');
  const today = new Date().toISOString().split('T')[0]; // get today's date in ISO format
  const modalPosition = React.useRef(new Animated.Value(0)).current;
  const agendaPRef = database.collection('users').doc(uid).collection('agendaP')
  const [isConnected, setIsConnected] = useState();
    const [loaded, setLoaded] = useState(false)
  function formatDate(timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');     
    return `${year}-${month}-${day}`;
  }
const noEventsMessage = selectedDate === today
  ? 'Não tens nada agendado para hoje'
  : 'Não tens nada agendado para este dia';
  const noEventsMessage2 = selectedDate === today
  ? 'Não tens nada pessoal agendado para hoje'
  : 'Não tens nada pessoal agendado para este dia';
  async function loadDataFromStorage() {
    const agendaData = await AsyncStorage.getItem('agenda');
    const turmaData = await AsyncStorage.getItem('turma');
    const agendaPData = await AsyncStorage.getItem('agendaP');
    setTurma(turmaData);
    console.log(agendaPData)
    if (agendaData !== null) {
      const parsedData = JSON.parse(agendaData).map((event) => {
        const [year,month,day] = event.data.split('-');
        const localDate = new Date(year, month - 1,day ,0,0,0);
        const offset = localDate.getTimezoneOffset() * 60000; // convert minutes to milliseconds
        const utcDate = new Date(localDate.getTime() - offset);
        return {
          ...event,
          data: utcDate.toISOString().split('T')[0]
        };
      });
      setEventDates(parsedData);
      
      
    }
  
    if (agendaPData !== null) {
      const parsedPData = JSON.parse(agendaPData);
      console.log(agendaPData)
      setPEventDates(parsedPData);
      
    }
   
  }
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
  
    return () => {
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(isConnected);
      setIsConnected(state.isConnected);
      
    });
    loadDataFromStorage();
    
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
    
    if (isConnected ) {
      
    if (turma) {
      agendaRef.doc(turma).collection('agenda')
        .onSnapshot((agendaDoc) => {
          const agenda = []
          console.log("mudou")
          agendaDoc.forEach((document) => {
            const titulo = document.data().titulo;
            const data = document.data().data;
            console.log(titulo)
            agenda.push({ data: formatDate(data), titulo });
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
  }, [isConnected]);

  

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
  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  
  const submitEvent =  () => {
    const eventPRef = agendaPRef.doc(); // create a new document reference with a random ID
    const eventPData = {
      titulo: newEvent,
      data: selectedDate,
      id: eventPRef.id // add the ID to the data object
    };
     eventPRef.set(eventPData); // add the data to the document
  }


LocaleConfig.defaultLocale = 'pt'
const markedDates = useMemo(() => {
  const allDates = [...eventDates, ...eventPDates];
  return allDates.reduce((obj, date) => {
    obj[date.data] = {
      selected: true,
      title: date.titulo,
    };
    return obj;
  }, {});
}, [eventDates, eventPDates]);
const currentDate = moment().format('YYYY-MM-DD');
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
    <TextInput
      style={styles.input}
      placeholder="Titulo do evento"
      onChangeText={text => setNewEvent(text)}
      value={newEvent}
    />
      <TouchableOpacity style={styles.submitButton} onPress={() => {
  submitEvent();
  closeModal();
}}>
      <Text style={styles.submitButtonText} >Save</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={closeModal}>
      <Text style={styles.cancelButtonText}>Cancel</Text>
    </TouchableOpacity>
    </View>
  </View>
</Modal>

    <Header></Header>
    <View style={{ flex: 1 }}>
    <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        pagingEnabled={true}
        hideExtraDays={true}
        firstDay={1}
        minDate={minDate}
        maxDate={maxDate}
        theme={{
          backgroundColor:'rgb(242,242,242)',
          calendarBackground:'rgb(242,242,242)',
          textMonthFontFamily:'sans-bold',
          textMonthFontSize:36,
          monthTextColor:'#1E1E1E',

          
        }}
      />
      
      
      <EventList
  events={eventDates}
  selectedDate={selectedDate}
  noEventsMessage={noEventsMessage}
/>
<EventPList
  events={eventPDates}
  selectedDate={selectedDate}
  noEventsMessage={noEventsMessage2}
  />

  
      <View style={styles.addEvent}>
      <TouchableOpacity style={styles.circleButton} onPress={openModal}>
    <Text style={styles.plus}>+</Text>
  </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginVertical: 20,
    width: '100%',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3498db',
    justifyContent:'center',
    alignItems:'center',
    paddingVertical: 5,
    width:70,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButtonText:{
    marginTop:5
  }
  
});
export default AgendaScreen;  