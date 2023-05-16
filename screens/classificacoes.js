import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,ScrollView, Pressable } from 'react-native';
import firebase from 'firebase';
import Collapsible from 'react-native-collapsible';
import Header from '../components/Header';
import { global } from '../styles/globals';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Classificacoes = () => {
  const [classificacoes, setClassificacoes] = useState({});
  const [activeSections, setActiveSections] = useState([]);
  const [activeTests, setActiveTests] = useState([]);
  const [isConnected, setIsConnected] = useState();
  const [nomeUtil,setNomeUtil] = useState()
  
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(isConnected);
      setIsConnected(state.isConnected);

    });
    
    const getData = async () => {
      const classificacoes = await AsyncStorage.getItem('classificacoes')
      if(classificacoes !== null){
        setClassificacoes(JSON.parse(classificacoes))
        
      }

    } 

    if(isConnected){
      const getDataDatabase = async () => {
        const nomeUtil = await AsyncStorage.getItem('nomeUtil');
      
      const dbRef = firebase.database().ref(`/users/${nomeUtil}/classificacoes`);
      dbRef.on('value', snapshot => {
        setClassificacoes(snapshot.val());
        AsyncStorage.setItem('classificacoes',JSON.stringify(snapshot.val()))
      });
    }
    setTimeout(getDataDatabase, 1000);
    }
    else{
      getData()

    }
    return () => {
      unsubscribeNetInfo();
    };
  }, [isConnected,nomeUtil]);

  const toggleExpanded = (collapsibleIndex, testIndex) => {
    if (testIndex === undefined) {
      let updatedActiveSections = [...activeSections];
      if (updatedActiveSections.includes(collapsibleIndex)) {
        updatedActiveSections = updatedActiveSections.filter(i => i !== collapsibleIndex);
      } else {
        updatedActiveSections.push(collapsibleIndex);
      }
      setActiveSections(updatedActiveSections);
    } else {
      let updatedActiveTests = [...activeTests];
      const testIsActive = updatedActiveTests.some(
        test => test.collapsibleIndex === collapsibleIndex && test.testIndex === testIndex
      );
      if (testIsActive) {
        updatedActiveTests = updatedActiveTests.filter(
          test => !(test.collapsibleIndex === collapsibleIndex && test.testIndex === testIndex)
        );
      } else {
        updatedActiveTests.push({ collapsibleIndex, testIndex });
      }
      setActiveTests(updatedActiveTests);
    }
  };

  return (
    classificacoes && 
    <View style={{flex:1}}>
    <Header></Header>
    
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
    
    <View style={styles.container}>
      <Text style={[global.h2,{marginBottom:10}]}>Classificações</Text>
      
      {Object.keys(classificacoes).map((className, index) => (
        <View key={index}>
          <Pressable onPress={() => toggleExpanded(index)} style={{backgroundColor:'#778ca3',padding:10,marginBottom:10,marginTop:10,borderRadius:10}}>
          <Text style={[global.h3,{color:'white'}]}>{className}</Text>
          </Pressable>
          <Collapsible collapsed={!activeSections.includes(index)}>
            {classificacoes[className].map((test, testIndex) => (
              <View key={testIndex}>
                <Pressable onPress={() => [toggleExpanded(index, testIndex)]} style={{backgroundColor:'#9abebb',padding:10,borderTopLeftRadius:10,borderTopRightRadius:10,marginTop:5}}>
                <Text style={[global.h3,{color:'white',fontSize:16}]} >{test.DtaAv}</Text>
                </Pressable>
                <Collapsible
                    collapsed={
                      !activeTests.some(
                        test => test.collapsibleIndex === index && test.testIndex === testIndex
                      )
                    }
                  >
                  <View style={{backgroundColor:'white',marginBottom:10,borderBottomLeftRadius:10,borderBottomRightRadius:10,padding:10}}>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                    <Text style={[global.p,{fontWeight:'bold'}]}>Tipo: </Text>
                    <Text style={[global.p]}>{test.Tipo}</Text>
                    </View>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                    <Text style={[global.p,{fontWeight:'bold'}]}>Peso: </Text>
                    <Text style={[global.p]}>{test.Peso}</Text>
                    </View>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                    <Text style={[global.p,{fontWeight:'bold'}]}>Escala: </Text>
                    <Text style={[global.p]}>{test.Escala}</Text>
                    </View>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                    <Text style={[global.p,{fontWeight:'bold'}]}>Nota: </Text>
                    <Text style={[global.p]}>{test.Nota}</Text>
                    </View>
                    <View style={{flexDirection:'row',marginBottom:10}}>
                    <Text style={[global.p,{fontWeight:'bold'}]}>Professor: </Text>
                    <Text style={[global.p]}>{test.Professor}</Text>
                    </View>
                  </View>
                </Collapsible>
              </View>
            ))}
          </Collapsible>
        </View>
      ))}
    </View>
    
    </ScrollView>
    </View>
  );
};

export default Classificacoes;

const styles = StyleSheet.create({
  container: {
    paddingVertical: '2%',
    paddingHorizontal: '3%',
    height: '100%',
  },
});