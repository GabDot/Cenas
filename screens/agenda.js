import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { Text, View, Modal, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput } from 'react-native';
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
  const eventosRef = database.collection('eventos');
  const [agenda, setAgenda] = useState([]);
  const [newEvent, setNewEvent] = useState('');
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

    useEffect(() => {
      if (isFocused && runFunction) {
        console.log(runFunction)
        
        setSelectedDate(selectedClickDate)
      }
    }, [isFocused]);
  async function loadDataFromStorage() {
    const agendaData = await AsyncStorage.getItem('agenda');
    const turmaData = await AsyncStorage.getItem('turma');
    const agendaPData = await AsyncStorage.getItem('agendaP');
    setTurma(turmaData);

    if (agendaData !== null) {
      const parsedData = JSON.parse(agendaData).map((event) => {
        const [year, month, day] = event.data.split('-');
        const localDate = new Date(year, month - 1, day, 0, 0, 0);
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

   
    

    if (isConnected) {

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
    console.log(selectedDate)

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

    if (selectedDateObj.getTime() >= today) {
      const eventP = [];
      const eventPRef = agendaPRef.doc();
      const eventPData = {
        titulo: newEvent,
        data: selectedDate,
        id: eventPRef.id
      };
      eventP.push(eventPData);
      setPEventDates(eventP);
      eventPRef.set(eventPData);
      AsyncStorage.setItem('agendaP', JSON.stringify(eventP));
      const agendaPData = await AsyncStorage.getItem('agendaP');
    } else {
      setIsModal2Visible(true)
    }
  }



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
      <Modal
        animationType='fade'
        visible={isModal2Visible}
        onRequestClose={() => setIsModal2Visible(false)}
        transparent={true}
      >
        <View style={styles.modalContainer}>

          <View style={styles.modalContent}>
            <TouchableOpacity style={[styles.closeButton]} onPress={() => setIsModal2Visible(false)}>
              <Text style={global.p}>X</Text>
            </TouchableOpacity>
            <Text style={global.p}>Não podes agendar nada para antes do dia de hoje</Text>
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