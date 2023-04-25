import React, { useState, useEffect } from 'react';
import { Text, View, Modal, TouchableOpacity,StyleSheet } from 'react-native';
import { Calendar,LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { global } from "../styles/globals";
import { database } from '../firebase';

const AgendaScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventDates, setEventDates] = useState([]);
  const eventosRef = database.collection('eventos');
  const [eventos, setEventos] = useState([]);
  
  async function loadDataFromStorage() {
    const agendaData = await AsyncStorage.getItem('agenda');
  
    if (agendaData !== null) {
      const parsedData = JSON.parse(agendaData).map((event) => {
        const [day, month, year] = event.data.split('/');
        const date = new Date(year, month - 1, day);
        return {
          ...event,
          data: date.toISOString().split('T')[0]
        };
      });
      setEventDates(parsedData);
      
    }
  }
  useEffect(() => {
    loadDataFromStorage();
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
    eventosRef.onSnapshot((querySnapshot) => {
      const eventos = [];
      querySnapshot.forEach((documentSnapshot) => {
          eventos.push(documentSnapshot.data());
        });
  
        if (eventos.length > 0) {
          setEventos(eventos);
          AsyncStorage.setItem('eventos', JSON.stringify(eventos));
        }
      });
  }, []);

  

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setModalVisible(false);
  };
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
  return (
    <>
    <Header></Header>
    <View style={{ flex: 1 }}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={eventDates.reduce((obj, date) => {
          obj[date.data] = {
            selected: true,
            title: date.titulo,
          };
          return obj;},{})}
        pagingEnabled={true}
        hideExtraDays={true}
        firstDay={1}
        theme={{
          backgroundColor:'rgb(242,242,242)',
          calendarBackground:'rgb(242,242,242)',
          textMonthFontFamily:'sans-bold',
          textMonthFontSize:36,
          monthTextColor:'#1E1E1E',

          
        }}
      />
      
       <View style={styles.infoContainer}>
 
    <Text style={[global.p]}>
      {eventDates
        .filter(event => event.data === selectedDate)
        .map((event, index) => `${event.titulo}\n\n`)
        .join('')
      }
    </Text>
  
</View>
      
    </View>
    </>
  );
};
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