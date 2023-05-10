import React, { useEffect, useState } from 'react';
import {View, SafeAreaView, StyleSheet, Text, Platform, UIManager} from 'react-native';
import {AccordionList} from 'react-native-accordion-list-view';
import Header from '../components/Header';
import { global } from '../styles/globals';
import { auth } from '../firebase';
import { database } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
const Classificacoes = () => {
    const uid = auth.currentUser.uid
    const notasRef = database.collection('users').doc(uid).collection('notas');
    const [notas,setNotas] = useState([])
    const [isConnected, setIsConnected] = useState();
    async function loadDataFromStorage(){
        const notasData = await AsyncStorage.getItem('notas');
        
        if (notasData !== null) {
            setNotas(JSON.parse(notasData));
            
          }
      }
      useEffect(() => {
        const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
          console.log(isConnected);
          setIsConnected(state.isConnected);
        });
      
        if (isConnected) {
          notasRef.onSnapshot((notasSnapshot) => {
            const notas = [];
      
            notasSnapshot.forEach((notasDoc) => {
              if (notasDoc.exists) {
                notas.push(notasDoc.data());
               
              }
            });
      
            
      
            if (notas.length > 0) {
              setNotas(notas);
              AsyncStorage.setItem('notas', JSON.stringify(notas));
            } else {
              setNotas([]);
              AsyncStorage.removeItem('notas');
            }
          });
        } else {
          loadDataFromStorage();
        }
      
        return () => {
          unsubscribeNetInfo();
        };
      }, [isConnected]);
      
      
      
      
      
      
      
    useEffect(() => {
        if (Platform.OS === 'android') {
            if (UIManager.setLayoutAnimationEnabledExperimental) {
                UIManager.setLayoutAnimationEnabledExperimental(true);
            }
        }
    }, []);
    return (
        <>
        <Header></Header>
        
            <View style={styles.container}>
                <AccordionList
                     data={notas}
                     customTitle={item => <Text>{item.title}</Text>}
                     customBody={item => <Text>{item.body}</Text>}
                    animationDuration={400}
                    expandMultiple={true}
                />
            </View>
       
        </>
    );
};

export default Classificacoes;
const styles = StyleSheet.create({
    container: {
        paddingVertical: '2%',
        paddingHorizontal: '3%',
        height: '100%',
        backgroundColor: '#e7e7e7',
    },
});