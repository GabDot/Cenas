import { View, Text, StyleSheet,ScrollView,RefreshControl,Button } from 'react-native'
import Header from '../components/Header';
import { database } from '../firebase';
import { global } from "../styles/globals";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';
import NetInfo from '@react-native-community/netinfo';
import * as OpenAnything from "react-native-openanything"
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function Ementa() {
    const ementaRef = database.collection('ementa');
    const [refreshing, setRefreshing] = useState(false);
    const [ementa, setEmenta] = useState([]);
    const [isConnected, setIsConnected] = useState();
    const wait = (timeout) => {
      return new Promise(resolve => setTimeout(resolve, timeout));
    }
    
    
      
    
      const onRefresh = () => {
        setRefreshing(true);
        // Call a function to fetch new data here
        wait(2000).then(() => setRefreshing(false));
      };
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
    },[isConnected,refreshing])
    
    const today = moment().startOf('week');
    const sortedDates = ementa
      .flatMap(month => Object.keys(month))
      .filter(date => moment(date) >= today)
      .sort((a, b) => moment(a) - moment(b));
    const sixDates = sortedDates.slice(0, 6);

    return (
      <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Header />
          <TouchableOpacity style={{backgroundColor:'#337AB7', marginTop:10,justifyContent:'center',alignItems:'center',width:'auto',borderRadius:5,height:40}}onPress={() => OpenAnything.Youtube('https://firebasestorage.googleapis.com/v0/b/areareservada-b5d8c.appspot.com/o/horariocantinatestes.pdf?alt=media&token=e2b243eb-dfe7-4790-aa03-9cbef7e931e0')}><Text style={[global.h3,{color:'white'}]}>Descarregar horário da cantina</Text></TouchableOpacity>
          {ementa.map((month, index) => (
            <View key={index} style={{marginTop:10}}>
              {sixDates.map(date => (
                <View key={date} style={[styles.container, moment(date).isSame(moment(), 'day') && {backgroundColor:'#D0247A'}]}>
                  <Text style={[{borderBottomWidth:1, paddingVertical:10,marginBottom:10,borderBottomColor:'#B5B4B4'},global.h2,moment(date).isSame(moment(), 'day') && {color:'white'}]}>{moment(date).locale('pt-br').format('dddd').toUpperCase()} | {date}</Text>
                  <Text style={[{marginBottom:5,marginTop:5},global.h3,moment(date).isSame(moment(), 'day') && {color:'white'}]}>CARNE:</Text>
                  <Text style={[global.p,moment(date).isSame(moment(), 'day') && {color:'white'}]}>{month[date].meat}</Text>
                  <Text style={[{marginBottom:5,marginTop:5},global.h3,moment(date).isSame(moment(), 'day') && {color:'white'}]}>PEIXE:</Text>                          
                  <Text style={[global.p,moment(date).isSame(moment(), 'day') && {color:'white'}]}>{month[date].fish}</Text>
                  <Text style={[{marginBottom:5,marginTop:5},global.h3,moment(date).isSame(moment(), 'day') && {color:'white'}]}>DIETA:</Text>
                  <Text style={[global.p,moment(date).isSame(moment(), 'day') && {color:'white'}]}>{month[date].diet}</Text>
                  <Text style={[{marginBottom:5,marginTop:5},global.h3,moment(date).isSame(moment(), 'day') && {color:'white'}]}>VEGETARIANO:</Text>
                  <Text style={[global.p,moment(date).isSame(moment(), 'day') && {color:'white'}]}>{month[date].vegan}</Text>
                </View>
              ))}
            </View>
          ))}
       </ScrollView>
       </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        
        
        paddingHorizontal:18,
        paddingVertical:10
       
        


    }
})