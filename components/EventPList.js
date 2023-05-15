import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { global } from '../styles/globals';
import firebase from 'firebase/app';
import { database } from '../firebase';
import 'firebase/database';
import ErrorModal from './ErrorModal';

const EventList = ({ events, noEventsMessage, selectedDate, isConnected, onRefresh }) => {
 

  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [errorMessage,setErrorMessage] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(['a']);

  const [newText, setNewText] = useState('')

  const filteredEvents = events.filter(event => event.DtaIni === selectedDate);

  const handleEdit = async (id) => {
    setModal2Visible(false);
    
    // Check if the device is offline
    if (!isConnected) {
      if(newText.length > 3 && newText.length < 20){
        // Store the edited event in AsyncStorage and update the original event
        const editedEvents = await AsyncStorage.getItem('editedEvents');
        const parsedEditedEvents = editedEvents ? JSON.parse(editedEvents) : [];
        const item = await AsyncStorage.getItem('eventP');
        const parsedItem = JSON.parse(item);
        const indexToUpdate = parsedItem.findIndex(obj => obj.id === id);
        parsedItem[indexToUpdate].Titulo = newText;
        parsedEditedEvents.push(parsedItem[indexToUpdate]);

        const currentDate = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);
        const eventDate = new Date(parsedItem[indexToUpdate].DtaIni);
        // Update the original event data in AsyncStorage with the edited event data
        const originalEventIndex = parsedItem.findIndex(obj => obj.id === id);
        parsedItem[originalEventIndex].Titulo = newText;
        await AsyncStorage.setItem('eventP', JSON.stringify(parsedItem));
  
        await AsyncStorage.setItem('editedEvents', JSON.stringify(parsedEditedEvents));
      } else {
        if(newText.length < 3){
          setModalErrorVisible(true)
          setErrorMessage('O novo nome dado ao evento é demasiado pequeno')
        } else {
          setModalErrorVisible(true)
          setErrorMessage('O novo nome dado ao evento é demasiado grande')
        }
      }
    } else {
      if(newText.length > 3 && newText.length < 20){
        const nomeUtil = await AsyncStorage.getItem('nomeUtil')
        const dbRef = firebase.database().ref(`users/${nomeUtil}/eventsP/${id}`);
        dbRef.update({
          Titulo: newText
        });
        const item = await AsyncStorage.getItem('eventP');
        const parsedItem = JSON.parse(item);
        const indexToUpdate = parsedItem.findIndex(obj => obj.id === id);
        parsedItem[indexToUpdate].Titulo = newText;
        await AsyncStorage.setItem('eventP', JSON.stringify(parsedItem));
      } else {
        if(newText.length < 3){
          setModalErrorVisible(true)
          setErrorMessage('O novo nome dado ao evento é demasiado pequeno')
        } else {
          setModalErrorVisible(true)
          setErrorMessage('O novo nome dado ao evento é demasiado grande')
        }
      }
    }
  };
  
  
  const handleDelete = async (id) => {
    setModalVisible(false);
  
    // Check if the device is offline
    if (!isConnected) {
      // Store the ID of the deleted event in AsyncStorage
      const deletedEvents = await AsyncStorage.getItem('deletedEvents');
      const parsedDeletedEvents = deletedEvents ? JSON.parse(deletedEvents) : [];
      parsedDeletedEvents.push(id);
      const item = await AsyncStorage.getItem('eventP');
    const parsedItem = JSON.parse(item);
    const indexToRemove = parsedItem.findIndex(obj => obj.id === selectedEvent.id);
    parsedItem.splice(indexToRemove, 1);
    await AsyncStorage.setItem('eventP', JSON.stringify(parsedItem));
    console.log("item parsed",parsedItem)
      await AsyncStorage.setItem('deletedEvents', JSON.stringify(parsedDeletedEvents));
      const item2 = await AsyncStorage.getItem('newEvents');
      const parsedItem2 = JSON.parse(item2);
      const indexToRemove2 = parsedItem2.findIndex(obj => obj.id === selectedEvent.id);
      parsedItem2.splice(indexToRemove2, 1);
      await AsyncStorage.setItem('newEvents', JSON.stringify(parsedItem2));
    } else {
      // Delete the event from the database
      const nomeUtil = await AsyncStorage.getItem('nomeUtil')
      const dbRef = firebase.database().ref(`users/${nomeUtil}/eventsP/${id}`);
      console.log(dbRef)
      dbRef.remove()
    }
    
  };

  return (
    
    <View style={styles.infoContainer}>
      <ErrorModal visible={modalErrorVisible} onClose={() => setModalErrorVisible(false) } message={errorMessage} ></ErrorModal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[{ fontWeight: 'bold' }, global.h2]}>{selectedEvent.Titulo}</Text>
            <Text style={[{ marginTop: 10, marginBottom: 20 }, global.p]}>O que pretende fazer com este evento?</Text>
            <View style={{ flexDirection: 'row', }}>
              
              <TouchableOpacity style={[styles.deleteButton,{marginRight:15}]} onPress={() => handleDelete(selectedEvent.id)}>

                <Text style={[global.p, { color: '#9abebb' }]}>Apagar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editButton]} onPress={() => {
                setModal2Visible(true)
                setModalVisible(false);

              }} >
                <Text style={[global.p, { color: 'white' }]}>Editar</Text>
              </TouchableOpacity>

            </View>
            <TouchableOpacity style={[styles.closeButton]} onPress={() => setModalVisible(false)}>
              <Text style={global.p}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal2Visible}
        onRequestClose={() => setModal2Visible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[{ fontWeight: 'bold' }, global.h2]}>{selectedEvent.Titulo}</Text>
            <TextInput
              style={styles.input}
              placeholder={selectedEvent.titulo}
              onChangeText={text => setNewText(text)}
              value={newText}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity style={[styles.cancelButton]} onPress={() => {setModal2Visible(false)
              setModalVisible(true)}}>

                <Text style={[global.p, { color: '#9abebb' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton]} >
                <Text style={[global.p, { color: 'white' }]} onPress={() => handleEdit(selectedEvent.id)}>Submeter</Text>
              </TouchableOpacity>


            </View>
            <TouchableOpacity style={[styles.closeButton]} onPress={() => setModal2Visible(false)}>
              <Text style={global.p}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {filteredEvents.length > 0 ? (
  filteredEvents.map(event => (
    <TouchableOpacity
      key={event.Titulo}
      onPress={() => {
        setSelectedEvent(event);
        setModalVisible(true);
      }}
      style={{marginBottom:10,height:30}}
    >
      <Text style={[{ fontWeight: 'bold' }, global.p]}>{event.Titulo}</Text>
    </TouchableOpacity>
  ))
) : (
  <Text style={[global.p]}>{noEventsMessage}</Text>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    height: 'auto',
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }, submitButton: {
    backgroundColor: '#9abebb',
    padding: 5,
    width: 100,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',

  }, cancelButton: {
    backgroundColor: 'white',
    borderWidth:1,
    borderColor:'#9abebb',
    padding: 5,
    width: 100,
    height: 50,
    marginRight: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    elevation: 5,
    
    
  },
  editButton: {
    backgroundColor: '#9abebb',
    padding: 5,
    width: 100,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'


  }, deleteButton: {
    backgroundColor: 'white',
    borderWidth:1,
    borderColor:'#9abebb',
    padding: 5,
    width: 100,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'

  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 25,
    height: 25,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }, input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginVertical: 20,
    fontSize: 16,
  },

});

export default EventList;
