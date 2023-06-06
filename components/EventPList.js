import React, { useState,useEffect,useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, TextInput, TurboModuleRegistryr } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { global } from '../styles/globals';
import firebase from 'firebase/app';
import { database } from '../firebase';
import 'firebase/database';
import ErrorModal from './ErrorModal';
import { useToast } from "react-native-toast-notifications";
import RNCalendarEvents from "react-native-calendar-events";
import { event } from 'react-native-reanimated';
const EventList = ({ events, noEventsMessage, selectedDate, isConnected, onRefresh }) => {
 

  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [errorMessage,setErrorMessage] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(['a']);
  const [hasRecurrence,setRecurrence] = useState();
  const toast = useToast();
  const [newText, setNewText] = useState('')
  const all = 'all'
  const future = 'future'

  const filteredEvents = events.filter(event => event.DtaIni === selectedDate);

  const handleEdit = async (idDb,id) => {
    setModal2Visible(false);
    
    // Check if the device is offline
    if (!isConnected) {
      if(newText.length >= 3 && newText.length < 20){
        toast.show('Esta tarefa pode demorar alguns segundos.', {
          type: "warning",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        })
        const editedEvents = await AsyncStorage.getItem('editedEvents');
       
        const parsedEditedEvents = editedEvents ? JSON.parse(editedEvents) : [];
        
        const item = await AsyncStorage.getItem('eventP');
        
        const parsedItem = JSON.parse(item);
       
        const indexToUpdate = parsedItem.findIndex(obj => obj.id === id);
       
        parsedItem[indexToUpdate].Titulo = newText;
        parsedEditedEvents.push(parsedItem[indexToUpdate]);
       
        RNCalendarEvents.saveEvent(newText,{
          id:id
        })
        const currentDate = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);
        const eventDate = new Date(parsedItem[indexToUpdate].DtaIni);
        // Update the original event data in AsyncStorage with the edited event data
        const originalEventIndex = parsedItem.findIndex(obj => obj.id === id);
        console.log("originaleventindex",originalEventIndex)
        parsedItem[originalEventIndex].Titulo = newText;
        console.log("parsedItem",parsedItem);
        await AsyncStorage.setItem('eventP', JSON.stringify(parsedItem));
  
        await AsyncStorage.setItem('editedEvents', JSON.stringify(parsedEditedEvents));
        toast.show('Evento editado', {
          type: "warning",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        })
        onRefresh()
      } else {
        if(newText.length <= 3){
          setModalErrorVisible(true)
          setErrorMessage('O novo nome dado ao evento é demasiado pequeno')
        } else {
          setModalErrorVisible(true)
          setErrorMessage('O novo nome dado ao evento é demasiado grande')
        }
      }
    } else {
      if(newText.length >= 3 && newText.length < 20){
        const nomeUtil = await AsyncStorage.getItem('nomeUtil')
        toast.show('Esta tarefa pode demorar alguns segundos.', {
          type: "warning",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        })
        const dbRef = firebase.database().ref(`users/${nomeUtil}/eventsP/${idDb}`);
        dbRef.update({
          Titulo: newText
        });
        RNCalendarEvents.saveEvent(newText,{
          id:id
        })
        const item = await AsyncStorage.getItem('eventP');
        const parsedItem = JSON.parse(item);
        const indexToUpdate = parsedItem.findIndex(obj => obj.id === id);
        parsedItem[indexToUpdate].Titulo = newText;
        await AsyncStorage.setItem('eventP', JSON.stringify(parsedItem));
        toast.show('Evento editado.', {
          type: "warning",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        })
        onRefresh()
      } else {
        if(newText.length <= 3){
          setModalErrorVisible(true)
          setErrorMessage('O novo nome dado ao evento é demasiado pequeno')
        } else {
          setModalErrorVisible(true)
          setErrorMessage('O novo nome dado ao evento é demasiado grande')
        }
      }
    }
  };
  
  
  const handleDelete = async (idDb,id,rec,selectedDate) => {
    setModalVisible(false);
    setModal3Visible(false)
    // Check if the device is offline
    if (!isConnected) {
      // Store the ID of the deleted event in AsyncStorage
      const deletedEvents = await AsyncStorage.getItem('deletedEvents');
      const parsedDeletedEvents = deletedEvents ? JSON.parse(deletedEvents) : [];
      parsedDeletedEvents.push(idDb);
      RNCalendarEvents.removeEvent(id)
      const item = await AsyncStorage.getItem('eventP');
    const parsedItem = JSON.parse(item);
    console.log(parsedItem)
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
      toast.show('Evento apagado', {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
      })
      onRefresh()
    } else {
      
      const nomeUtil = await AsyncStorage.getItem('nomeUtil')
      const dbRef = firebase.database().ref(`users/${nomeUtil}/eventsP/${idDb}`);
      
      dbRef.remove()
      if(rec == 'all'){
       
        RNCalendarEvents.removeEvent(id);
        toast.show('Evento apagado.', {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        })
      }
      else if(rec =='future'){
      //   console.log("entrou")
         const startDate = new Date(selectedDate);
      
        RNCalendarEvents.removeEvent(id,{
          exceptionDate: startDate.toISOString()
        });
      // });
        
      }
      /*Se for todos, a data é global e apaga um a um dessa data, se for apenas os futuros, a data é apartir desse dia selecionado e apagada todos pra frente*/
      
      onRefresh()
    }
    
  };
  const checkEventRecurrence = async (selectedDate) => {
    try {
      const startDate = new Date(selectedDate);
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      const events = await RNCalendarEvents.fetchAllEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );
      const check = events.filter(event => event.recurrence === 'daily' || event.recurrence === 'weekly' || event.recurrence === 'monthly');
      if(check.length > 0){
        setRecurrence(undefined);
        setRecurrence(true);
       
        
      }
      else{
        setRecurrence(undefined);
        setRecurrence(false);
        
       
      }
    } catch (error) {
      console.error(error);
      return false;
    }
    
  };
  const isFirstRender = useRef(true);

useEffect(() => {
  if (!isFirstRender.current) {
    handleDeleteEvent();
    console.log(hasRecurrence)
  } else {
    isFirstRender.current = false;
  }
}, [hasRecurrence]);
  const handleDeleteEvent = () => {
    if (hasRecurrence === true) {
      setModal3Visible(true);
    } else if (hasRecurrence === false) {
      handleDelete(selectedEvent.idDb, selectedEvent.id, all);
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
              
              <TouchableOpacity style={[styles.deleteButton,{marginRight:15}]} onPress={() =>{checkEventRecurrence(selectedEvent.DtaIni)}}>

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
                <Text style={[global.p, { color: 'white' }]} onPress={() => handleEdit(selectedEvent.idDb,selectedEvent.id)}>Submeter</Text>
              </TouchableOpacity>


            </View>
            <TouchableOpacity style={[styles.closeButton]} onPress={() => setModal2Visible(false)}>
              <Text style={global.p}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal3Visible}
        onRequestClose={() => setModal3Visible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[{ fontWeight: 'bold' }, global.h2]}>{selectedEvent.Titulo}</Text>
           
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' ,marginTop:10}}>
              <TouchableOpacity style={[styles.cancelButton]} onPress={() =>{ handleDelete(selectedEvent.idDb,selectedEvent.id,all)}}>

                <Text style={[global.p, { color: '#9abebb' }]}>Apagar todos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton]} >
                <Text style={[global.p, { color: 'white' }]} onPress={() =>{ handleDelete(selectedEvent.idDb,selectedEvent.id,future,selectedEvent.DtaIni)}}>Apagar futuros</Text>
              </TouchableOpacity>


            </View>
            <TouchableOpacity style={[styles.closeButton]} onPress={() => setModal3Visible(false)}>
              <Text style={global.p}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {filteredEvents.length > 0 ? (
  filteredEvents.map(event => (
    <TouchableOpacity
      key={`${event.id}-${event.startDate}`}
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
