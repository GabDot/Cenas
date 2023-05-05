import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { global } from '../styles/globals';
import { database } from '../firebase';
import { auth } from '../firebase';

const EventList = ({ events, noEventsMessage, selectedDate, isConnected }) => {
  const uid = auth.currentUser.uid
  const agendaPRef = database.collection('users').doc(uid).collection('agendaP')
  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(['a']);

  const [newText, setNewText] = useState('')

  const filteredEvents = events.filter(event => event.data === selectedDate);

  const handleEdit = async (id) => {
    setModal2Visible(false);
  
    // Check if the device is offline
    if (!isConnected) {
      // Store the edited event in AsyncStorage
      const editedEvents = await AsyncStorage.getItem('editedEvents');
      const parsedEditedEvents = editedEvents ? JSON.parse(editedEvents) : [];
      parsedEditedEvents.push({ id, titulo: newText });
      await AsyncStorage.setItem('editedEvents', JSON.stringify(parsedEditedEvents));
    } else {
      // Update the event in the database
      agendaPRef.doc(id).update({
        titulo: newText
      });
    }
  
    // Update AsyncStorage
    const item = await AsyncStorage.getItem('agendaP');
    const parsedItem = JSON.parse(item);
    const indexToUpdate = parsedItem.findIndex(obj => obj.id === id);
    parsedItem[indexToUpdate].titulo = newText;
    await AsyncStorage.setItem('agendaP', JSON.stringify(parsedItem));
  };
  
  const handleDelete = async (id) => {
    setModalVisible(false);
  
    // Check if the device is offline
    if (!isConnected) {
      // Store the ID of the deleted event in AsyncStorage
      const deletedEvents = await AsyncStorage.getItem('deletedEvents');
      const parsedDeletedEvents = deletedEvents ? JSON.parse(deletedEvents) : [];
      parsedDeletedEvents.push(id);
      await AsyncStorage.setItem('deletedEvents', JSON.stringify(parsedDeletedEvents));
    } else {
      // Delete the event from the database
      agendaPRef.doc(id).delete();
    }
  
    // Update AsyncStorage
    const item = await AsyncStorage.getItem('agendaP');
    const parsedItem = JSON.parse(item);
    const indexToRemove = parsedItem.findIndex(obj => obj.id === selectedEvent.id);
    parsedItem.splice(indexToRemove, 1);
    await AsyncStorage.setItem('agendaP', JSON.stringify(parsedItem));
  };

  return (
    <View style={styles.infoContainer}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[{ fontWeight: 'bold' }, global.h2]}>{selectedEvent.titulo}</Text>
            <Text style={[{ marginTop: 10, marginBottom: 20 }, global.p]}>O que pretende fazer com este evento?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity style={[styles.editButton]} onPress={() => {
                setModal2Visible(true)
                setModalVisible(false);

              }} >
                <Text style={[global.p, { color: 'white' }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteButton]} onPress={() => handleDelete(selectedEvent.id)}>

                <Text style={[global.p, { color: 'white' }]}>Delete</Text>
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
            <Text style={[{ fontWeight: 'bold' }, global.h2]}>{selectedEvent.titulo}</Text>
            <TextInput
              style={styles.input}
              placeholder={selectedEvent.titulo}
              onChangeText={text => setNewText(text)}
              value={newText}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity style={[styles.cancelButton]} onPress={() => {setModal2Visible(false)
              setModalVisible(true)}}>

                <Text style={[global.p, { color: 'white' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton]} >
                <Text style={[global.p, { color: 'white' }]} onPress={() => handleEdit(selectedEvent.id)}>Submit</Text>
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
      key={event.titulo}
      onPress={() => {
        setSelectedEvent(event);
        setModalVisible(true);
      }}
      style={{marginBottom:10,height:40,padding:10}}
    >
      <Text style={[{ fontWeight: 'bold' }, global.p]}>{event.titulo}</Text>
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
    backgroundColor: '#337AB7',
    padding: 5,
    width: 100,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',

  }, cancelButton: {
    backgroundColor: '#C7254E',
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
    padding: 35,
    elevation: 5,
  },
  editButton: {
    backgroundColor: '#337AB7',
    padding: 5,
    width: 100,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'


  }, deleteButton: {
    backgroundColor: '#C7254E',
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
