import React, { useEffect, useState} from 'react';
import {View, SafeAreaView, StyleSheet, Text, Platform, UIManager,FlatList} from 'react-native';
import {AccordionList} from 'react-native-accordion-list-view';
import { ActivityIndicator } from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import Header from '../components/Header';
import { global } from '../styles/globals';
import { auth } from '../firebase';
import { database } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
const Classificacoes = () => {
  const uid = auth.currentUser.uid;
  const notasRef = database.collection('users').doc(uid).collection('notas');
  const [notas, setNotas] = useState({});
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState();
  const [activeSections, setActiveSections] = useState([]);
  const [sections, setSections] = useState([]);

  async function loadDataFromStorage() {
  
    const notasData = await AsyncStorage.getItem('notas');
  
    if (notasData !== null && notasData !== undefined) {
      setNotas(JSON.parse(notasData));
      setSections(Object.entries(JSON.parse(notasData)).map(([className, notasData]) => ({
        title: className,
        content: notasData,
      })));
      setLoading(false);
    }
  
}


  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    if (isConnected) {
      notasRef.onSnapshot((notasSnapshot) => {
        const notasData = {};

        notasSnapshot.forEach((classDoc) => {
          const className = classDoc.id;
          const notas = [];

          classDoc.ref.collection('notas').get().then((notaDocs) => {
            notaDocs.forEach((notaDoc) => {
              const date = notaDoc.id;
              const notaData = notaDoc.data();
              notasData[className] = notasData[className] || {};
              notasData[className][date] = notaData;
            });

            
            setSections(Object.entries(notasData).map(([className, notasData]) => ({
              title: className,
              content: notasData,
            })));
            console.log(sections)
            setLoading(false);
            AsyncStorage.setItem('notas', JSON.stringify(notasData));
          });
        });
      });
    } else {
      loadDataFromStorage();
      
    }

    return () => {
      unsubscribeNetInfo();
    };
  }, [isConnected]);

  const renderHeader = (section) => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>{section.title}</Text>
      </View>
    );
  };

  const renderContent = (section) => {
    if (!notas || !notas[section.title]) {
      return null;
    }
  
    return notas.map((classObj) => (
      <View key={classObj.title}>
        <Text style={styles.classTitle}>{classObj.title}</Text>
        {Object.entries(classObj.content).map(([date, nota]) => (
          <View style={styles.table} key={date}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Date:</Text>
              <Text style={styles.tableCell}>{date}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Tipo:</Text>
              <Text style={styles.tableCell}>{nota.tipo}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Professor:</Text>
              <Text style={styles.tableCell}>{nota.professor}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Escala:</Text>
              <Text style={styles.tableCell}>{nota.escala}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Nota:</Text>
              <Text style={styles.tableCell}>{nota.nota}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Peso:</Text>
              <Text style={styles.tableCell}>{nota.peso}</Text>
            </View>
          </View>
        ))}
      </View>
    ));
        }
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      <Header />
      <Accordion
        sections={sections}
        activeSections={activeSections}
        renderHeader={renderHeader}
        renderContent={renderContent}
        onChange={setActiveSections}
      />
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
    },header: {
      backgroundColor: '#F5FCFF',
      padding: 10,
    },
    headerText: {
      fontSize: 16,
      fontWeight: '500',
    },
    content: {
      backgroundColor: '#fff',
      padding: 10,
    }, row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    date: {
      fontWeight: 'bold',
      fontSize: 16,
      flex: 1,
    },
    note: {
      flex: 2,
      marginLeft: 16,
    },
});