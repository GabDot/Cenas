import { View, Text, StyleSheet,ScrollView } from 'react-native'
import Header from '../components/Header';
import { database } from '../firebase';
import { global } from "../styles/globals";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';
import NetInfo from '@react-native-community/netinfo';
export default function Ementa() {
    const ementaRef = database.collection('ementa');
    const [ementa, setEmenta] = useState([]);
    const [isConnected, setIsConnected] = useState();
    async function loadDataFromStorage(){
      const ementaData = await AsyncStorage.getItem('ementa');
      
      if (ementaData !== null) {
          setEmenta(JSON.parse(ementaData));
          
        }
    }
    
    useEffect( () => {
      const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        console.log(isConnected);
        setIsConnected(state.isConnected);
  
      });
      loadDataFromStorage()
      if(isConnected){
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
        }
        return () => {
          unsubscribeNetInfo();
        };
    },[isConnected])
    
    const today = moment().startOf('week');
    const sortedDates = ementa
      .flatMap(month => Object.keys(month))
      .filter(date => moment(date) >= today)
      .sort((a, b) => moment(a) - moment(b));
    const sixDates = sortedDates.slice(0, 6);

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Header />
          {ementa.map((month, index) => (
            <View key={index} style={{marginTop:10}}>
              {sixDates.map(date => (
                <View key={date} style={[styles.container, moment(date).isSame(moment(), 'day') && {backgroundColor:'#D0247A'}]}>
                  <Text style={[{borderBottomWidth:1, paddingVertical:10,marginBottom:10,borderBottomColor:'#B5B4B4'},global.h2]}>{moment(date).locale('pt-br').format('dddd').toUpperCase()} | {date}</Text>
                  <Text style={[{marginBottom:5,marginTop:5},global.h3]}>CARNE:</Text>
                  <Text style={global.p}>{month[date].meat}</Text>
                  <Text style={[{marginBottom:5,marginTop:5},global.h3]}>PEIXE:</Text>                          
                  <Text style={global.p}>{month[date].fish}</Text>
                  <Text style={[{marginBottom:5,marginTop:5},global.h3]}>DIETA:</Text>
                  <Text style={global.p}>{month[date].diet}</Text>
                  <Text style={[{marginBottom:5,marginTop:5},global.h3]}>VEGETARIANO:</Text>
                  <Text style={global.p}>{month[date].vegan}</Text>
                </View>
              ))}
            </View>
          ))}
       </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        
        
        paddingHorizontal:18,
        paddingVertical:10
       
        


    }
})