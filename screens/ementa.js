import { View, Text, StyleSheet,ScrollView,RefreshControl,Button } from 'react-native'
import Header from '../components/Header';
import firebase from 'firebase';
import { global } from "../styles/globals";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';
import NetInfo from '@react-native-community/netinfo';
import * as OpenAnything from "react-native-openanything"
import { TouchableOpacity } from 'react-native-gesture-handler';

const Ementa = () => {
  const [ementaData, setEmentaData] = useState(null);
  const [isConnected, setIsConnected] = useState();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Call a function to fetch new data here
    wait(2000).then(() => setRefreshing(false));
  };

   
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}


  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(isConnected);
      setIsConnected(state.isConnected);

    });
    const getData = async () => {
      const ementa = await AsyncStorage.getItem('ementa')
      if(ementa !== null){
        setEmentaData(JSON.parse(ementa))
      }

    } 
    if(isConnected){

    
    const db = firebase.database();
    db.ref('/ementa').on('value', snapshot => {
      const data = snapshot.val();
      const filteredData = Object.keys(data)
        .filter(key => {
          const date = moment(data[key].Dta, 'YYYY-M-D');
          return date.isSame(moment(), 'week');
        })
        .map(key => data[key])
        .sort((a, b) => moment(a.Dta, 'YYYY-M-D').diff(moment(b.Dta, 'YYYY-M-D')));
      setEmentaData(filteredData);
      
      AsyncStorage.setItem('ementa',JSON.stringify(filteredData))
    });
  }
  else{
    getData()
  }
  return () => {
    unsubscribeNetInfo();
  };
  }, [isConnected,refreshing]);

  if (!ementaData) {
    return <Text>Loading...</Text>;
  }

  return (
    
      
    <View  style={{flex:1}}>
      <Header></Header>
      <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <ScrollView style={{flex:1}}>
      {Object.keys(ementaData).map(key => {
        const dayData = ementaData[key];
        const date = dayData.Dta;
       
        return (
          <View key={key} style={{ marginTop: 10 }}>
            <View
              style={[
                styles.container,
                moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { backgroundColor: '#D0247A' },
              ]}
            >
              <Text
                style={[
                  {
                    borderBottomWidth: 1,
                    
                    marginBottom: 10,
                    borderBottomColor: '#B5B4B4',
                  },
                  global.h2,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                {moment(date, 'YYYY-M-D').locale('pt-br').format('dddd').toUpperCase()} | {date}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                CARNE:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Carne}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                PEIXE:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Peixe}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                DIETA:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Dieta}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                VEGETARIANO:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Vegetariano}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                SOBREMESA:
              </Text>
              <Text style={[global.p, moment(date, 'YYYY-M-D').isSame(moment(), 'day') && { color: 'white' }]}>
                {dayData.Sobremesa}
              </Text>
              
            </View>
          </View>
        );
      })}
     </ScrollView>
     </ScrollView>
    </View>
   
  );
};
export default Ementa;
const styles = StyleSheet.create({
    container: {
        paddingHorizontal:18,
        paddingVertical:25
        
    },
    title:{
      
    }
})