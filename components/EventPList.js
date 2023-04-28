import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { global } from '../styles/globals';
import { database } from '../firebase';
import { auth } from '../firebase';

const EventList = ({ events, noEventsMessage, selectedDate }) => {
  const uid = auth.currentUser.uid
const agendaPRef = database.collection('users').doc(uid).collection('agendaP')
  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(['a']);
  const [newText, setNewText] = useState('')
  
  const filteredEvents = events.filter(event => event.data === selectedDate);

  const handleEdit = (id) => {
 
    agendaPRef.doc(id).update({
      titulo: newText
    })
    setModal2Visible(false);
    
  };

  const handleDelete = (id) => {
    
    agendaPRef.doc(id).delete()
    setModalVisible(false);
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
            <Text style={[{fontWeight:'bold'},global.h2]}>{selectedEvent.titulo }</Text>
            <Text style={[{marginTop:10,marginBottom:20},global.p]}>O que pretende fazer com este evento?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity style={[styles.editButton]}onPress={() => {
  setModal2Visible(true) 
  setModalVisible(false);
  
}} >
    <Text style={[global.p,{color:'white'}]}>Edit</Text>
  </TouchableOpacity>
  <TouchableOpacity style={[styles.deleteButton]} onPress={() => handleDelete(selectedEvent.id)}>
    
    <Text style={[global.p,{color:'white'}]}>Delete</Text>
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
            <Text style={[{fontWeight:'bold'},global.h2]}>{selectedEvent.titulo }</Text>
            <TextInput
      style={styles.input}
      placeholder={selectedEvent.titulo}
      onChangeText={text => setNewText(text)}
      value={newText}
    />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity style={[styles.deleteButton]} onPress={() => handleDelete(selectedEvent.id)}>
    
    <Text style={[global.p,{color:'white'}]}>Cancel</Text>
  </TouchableOpacity>
            <TouchableOpacity style={[styles.editButton]} >
    <Text style={[global.p,{color:'white'}]} onPress={() => handleEdit(selectedEvent.id)}>Submit</Text>
  </TouchableOpacity>
  
             
            </View>
            <TouchableOpacity style={[styles.closeButton]} onPress={() => setModalVisible(false)}>
    <Text style={global.p}>X</Text>
  </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {filteredEvents.length > 0 ? (
        <TouchableOpacity onPress={() => {
          setSelectedEvent(filteredEvents[0]);
          setModalVisible(true);
        }}>
          <Text style={[{fontWeight:'bold'},global.p]}>
            {filteredEvents.map((event, index, array) => {
              const separator = index === array.length - 1 ? '' : '\n\n';
              return `${event.titulo}${separator}`;
            })}
          </Text>
        </TouchableOpacity>
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
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    elevation: 5,
  },
  editButton:{
    backgroundColor:'#337AB7',
    padding:5,
    width:100,
    height:50,
    borderRadius:8,
    alignItems:'center',
    justifyContent:'center'
    

  },deleteButton:{
    backgroundColor:'#C7254E',
    padding:5,
    width:100,
    height:50,
    borderRadius:8,
    alignItems:'center',
    justifyContent:'center'

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
  },
 
});

export default EventList;