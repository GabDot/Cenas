import { View, Text, StyleSheet,ScrollView,RefreshControl,Button,ActivityIndicator, TouchableOpacity } from 'react-native'
import Header from '../components/Header';
import firebase from 'firebase';
import { global } from "../styles/globals";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';
import NetInfo from '@react-native-community/netinfo';
import RadioInput from '../components/radio';
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
import DatePicker from 'react-native-date-picker'

const Ementa = () => {
  const [ementaData, setEmentaData] = useState(null);
  const [isConnected, setIsConnected] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading,setIsLoading] = useState(true);
  const [today,setToday] = useState(new Date());
  const [date1,setDate1] = useState();
  const [date2,setDate2] = useState();
  const todayToday = new Date();
  const tk = 'Y-WywHe6uXAVa9z9yfUZVfEuODDRzbftZ-0JylWY0kqb46MXL9FYloflIO5vnj4vPS1V3hJ4aP0YasupkgI0FdpvYBt9PCcGDdd5lbGazugYZWvy0YiPPdCeuYkJS5Wr5JRZEC3jye8r3LXQSM3QM673d-uXXbeL_VmWrd8NGa3LlcRonsgqT6aNLoRcqpSZBNQBkRTc1e2g-NU82g4b-7bNDU1sJyp0KuiBVHggwO9dH5kOwAa3rN1oivBW0jtedDeYNEQe8QAMYWxGXviIg3X9TIbzPX7dSt759rJtK92ecqd8e60bRyTOcOUMhD8z';
  const API_URL = 'https://geweb3.cic.pt/GEWebApi/token';
  const [open, setOpen] = useState(false)
  const [apiData, setApiData] = useState({});

  
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
  };
  const handleSync = async () => {
    setIsLoading(true);
    
    const username = await AsyncStorage.getItem('username');
    const password = await AsyncStorage.getItem('password');
    console.log(username)
    console.log(password)
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
      console.log(dataToken.access_token)
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
      console.log('User exists');
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
  const getEvents = async (token) => {
   
  
    const response = await fetch('https://geweb3.cic.pt/GEWebApi/api/event', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (response.ok) {
      const dataResponse = await response.json();
      
      return dataResponse.map(({ Titulo, Tipo, DtaIni }) => ({
        Titulo,
        Tipo,
        DtaIni: DtaIni.split('T')[0],
      }));
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

  const onRefresh = () => {
    setRefreshing(true);
    if(isConnected){
      handleSync()
    }
    // Call a function to fetch new data here
    wait(2000).then(() => setRefreshing(false));
  };

   
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}


  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log("yau",isConnected);
      setIsConnected(state.isConnected);

    });
    if(isConnected){
      setIsLoading(true)
      async function fetchData() {
        const parser = new XMLParser();
        
        const todayCopy = new Date(today.getTime());
const firstDayOfWeek = new Date(todayCopy.setDate(todayCopy.getDate() - todayCopy.getDay()));
        const lastDayOfWeek = new Date(todayCopy.setDate(todayCopy.getDate() - todayCopy.getDay() + 8));
        const dt1 = formatDate(firstDayOfWeek);
        const dt2 = formatDate(lastDayOfWeek);
        setDate1(moment(dt1, 'DD/MM/YYYY').startOf('day'))
        setDate2(moment(dt2, 'DD/MM/YYYY').startOf('day'))
        const details = {
          'tk':tk,
          'dt1': dt1,
          'dt2': dt2,

        };
      
        var formBody = [];
        for (var property in details) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(details[property]);
          formBody.push(encodedKey + "=" + encodedValue);
          
        }
        formBody = formBody.join("&");
      
        const response = await fetch('https://www.cic.pt/alunos/srvlistamenu.asp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=ISO-8859-1'
          },
          body: formBody
        });

        const blob = await response.blob();
  const text = await convertBlobToText(blob, 'ISO-8859-1');

  const data = parser.parse(text);
  setEmentaData(data);
  AsyncStorage.setItem('ementa', JSON.stringify(data));
  setIsLoading(false);
  
}

async function convertBlobToText(blob, encoding) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(blob, encoding);
  });

      }
   fetchData()
      
    
  }
  else{
   async function getAsyncEmenta()  {
    AsyncStorage.getItem('ementa')
    .then((dataString) => {
      if (dataString) {
        // Parse the stringified data back to its original structure
        const ementaData = JSON.parse(dataString);
        setEmentaData(ementaData)
        console.log("ementa",ementaData)
        setIsLoading(false)
      }
      })  
        
    }
    setTimeout(getAsyncEmenta, 1500);
  }
  return () => {
    unsubscribeNetInfo();
  };
  }, [isConnected,refreshing]);
  if (!ementaData) {
    return <Text>Loading...</Text>;
  }
  const menuData = ementaData && ementaData.ementa && ementaData.ementa.menu;

  return (
    
    isLoading  ? (
      <View style={{ flex: 1 }}>
        
         <Header></Header>
         <ActivityIndicator size={100} color='#9A9DBE'/>
        </View>
        
      ):(
        menuData? (
<View  style={{flex:1}}>
      <Header></Header>
      <View style={{marginTop:20,marginLeft:'8%'}}>
      </View>
      <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <ScrollView style={{flex:1}}>
        {isConnected&&(<TouchableOpacity style={styles.submitButton} title="Open" onPress={() => setOpen(true)} ><Text style={[global.p,{color:'white',fontSize:20}]}>Trocar data: {moment(today).format('DD/MM/YYYY')}</Text></TouchableOpacity>)}
      
      
      <DatePicker
        modal
        open={open}
        date={today}
        mode='date'
        onConfirm={(date) => {
          setOpen(false)
          setToday(date)
          onRefresh();
        }}
        onCancel={() => {
          setOpen(false)
        }}
      />
      {menuData && menuData.map((dayData, index) => {
      const date = dayData.data;
      const dateComp = moment(dayData.data, 'DD/MM/YYYY').startOf('day')
      const carne = dayData.normal["#text"] || dayData.normal
      const peixe = dayData.opcao["#text"] || dayData.peixe;
      const dieta = dayData.dieta["#text"] || dayData.dieta;
      const vegetariano =  dayData.vegetariano["#text"] || dayData.vegetariano;
      const sobremesa = dayData.sobremesa["#text"] || dayData.sobremesa;
        
       
        return (
          <View key={index} style={{ marginTop: 10 }}>
            <View
              style={[
                styles.container,
                moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { backgroundColor: '#D0247A' },
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
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                {moment(date, 'DD/MM/YYYY').locale('pt-br').format('dddd').toUpperCase()} | {date}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                CARNE:
              </Text>
              <Text style={[global.p, moment(date,'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {carne}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                PEIXE:
              </Text>
              <Text style={[global.p, moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {peixe}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                DIETA:
              </Text>
              <Text style={[global.p, moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {dieta}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                VEGETARIANO:
              </Text>
              <Text style={[global.p, moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {vegetariano}
              </Text>
              <Text
                style={[
                  { marginBottom: 5, marginTop: 5 },
                  global.h3,
                  moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' },
                ]}
              >
                SOBREMESA:
              </Text>
              <Text style={[global.p, moment(date, 'DD/MM/YYYY').isSame(moment(), 'day') && { color: 'white' }]}>
                {sobremesa}
              </Text>
              {console.log("date",dateComp)}
              
              {dateComp>todayToday?(
                <RadioInput date={date} refreshing={refreshing} disabled={false}/>
              ):
              (
                <RadioInput date={date} refreshing={refreshing} disabled={true}/>
              )}
              

            </View>
          </View>
        );
      })}
     </ScrollView>
     </ScrollView>
    </View>
        ):(
          <View style={{ flex: 1 }}>
        
         <Header></Header>
        
         <TouchableOpacity style={styles.submitButton} title="Open" onPress={() => setOpen(true)} ><Text style={[global.p,{color:'white',fontSize:20}]}>Trocar data: {moment(today).format('DD/MM/YYYY')}</Text></TouchableOpacity>
         
         <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
         <Text style={global.h3}>Não existem almoços neste dia</Text>
         </View>
         <DatePicker
        modal
        open={open}
        date={today}
        mode='date'
        onConfirm={(date) => {
          setOpen(false)
          setToday(date)
          onRefresh();
        }}
        onCancel={() => {
          setOpen(false)
        }}
      />
        </View>
        )
    
   
  )
  )
};
export default Ementa;
const styles = StyleSheet.create({
    container: {
        paddingHorizontal:18,
        paddingVertical:25
        
    },
    submitButton: {
      marginTop:5,
      backgroundColor: '#9abebb',
      padding: 5,
      width: '100%',
      height: 50,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
  
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
    },
})