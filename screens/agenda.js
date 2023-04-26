import React, { useState, useEffect,useCallback,useMemo } from 'react';
import { Text, View, Modal, TouchableOpacity,StyleSheet,ScrollView } from 'react-native';
import { Calendar,LocaleConfig,CalendarList } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { global } from "../styles/globals";
import { database } from '../firebase';
import { auth } from '../firebase';

const AgendaScreen = React.memo(() => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const uid = auth.currentUser.uid
  const agendaRef = database.collection('users').doc(uid).collection('agenda');
  const [eventDates, setEventDates] = useState([]);
  const eventosRef = database.collection('eventos');
  const [agenda, setAgenda] = useState([]);
  const today = new Date().toISOString().split('T')[0]; // get today's date in ISO format
  function formatDate(timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');     
    return `${day}/${month}/${year}`;
  }
const noEventsMessage = selectedDate === today
  ? 'Não tens nada agendado para hoje'
  : 'Não tens nada agendado para este dia';
  async function loadDataFromStorage() {
    const agendaData = await AsyncStorage.getItem('agenda');
    
    if (agendaData !== null) {
      const parsedData = JSON.parse(agendaData).map((event) => {
        const [day, month, year] = event.data.split('/');
        const localDate = new Date(year, month - 1, day,0,0,0);
        const offset = localDate.getTimezoneOffset() * 60000; // convert minutes to milliseconds
        const utcDate = new Date(localDate.getTime() - offset);
        return {
          ...event,
          data: utcDate.toISOString().split('T')[0]
        };
      });
      setEventDates(parsedData);
     
      
    }
  }
  
  useEffect(() => {
    loadDataFromStorage();
    
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
    agendaRef.onSnapshot({ source: 'server' },(querySnapshot) => {
      const agenda = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data().data;
        const titulo = doc.data().titulo;
        agenda.push({ data: formatDate(data), titulo });
      });
      if (agenda.length > 0) {
        setAgenda(agenda);
        AsyncStorage.setItem('agenda', JSON.stringify(agenda));
        loadDataFromStorage();
        
      }
    });
  }, []);

  useEffect(() => {
    console.log(eventDates);
  }, [eventDates]);

  const onDayPress = useCallback((day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
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
  
LocaleConfig.defaultLocale = 'pt'
const markedDates = useMemo(() => {
  return eventDates.reduce((obj, date) => {
    obj[date.data] = {
      selected: true,
      title: date.titulo,
    };
    return obj;
  }, {});
}, [eventDates]);
  return (
    <>
    <Header></Header>
    <View style={{ flex: 1 }}>
    <CalendarList
  onDayPress={onDayPress}
  markedDates={markedDates}
  hideArrows
  pastScrollRange={10}
  futureScrollRange={10}
  pagingEnabled={true}
  hideExtraDays={true}
  firstDay={1}
  horizontal={true}
  theme={{
    backgroundColor: 'rgb(242,242,242)',
    calendarBackground: 'rgb(242,242,242)',
    textMonthFontFamily: 'sans-bold',
    textMonthFontSize: 36,
    monthTextColor: '#1E1E1E',
  }}
/>
      
      <View style={styles.infoContainer}>
    {eventDates.filter(event => event.data === selectedDate).length > 0 ? (
      <Text style={[global.p]}>
        {eventDates
          .filter(event => event.data === selectedDate)
          .map((event, index, array) => {
            const separator = index === array.length - 1 ? '' : '\n\n';
            return `${event.titulo}${separator}`;
          })
        }
      </Text>
    ) : (
      <Text style={[global.p]}>{noEventsMessage}</Text>
    )}
  </View>
      
    </View>
    </>
  );
});
const styles = StyleSheet.create({
  infoContainer:{
    height:'auto',
    marginTop:20,
    marginLeft:20,
    marginRight:20,
    backgroundColor:'white',
    borderRadius:10,
    padding:20
  },
  
});
export default AgendaScreen;  