import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { global } from "../styles/globals";
import moment from 'moment';
import { useState } from "react";
import 'moment/locale/pt'; 
import { database } from '../firebase';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Entypo';

export default function EmentaItem({ ementa,cantinaHorario }) {
    const today = new Date().toISOString().split('T')[0];
    const [modalVisible, setModalVisible] = useState(false);

    const handlePress = () => {
      setModalVisible(true);
    };

    return (
     
      <>
      
      
        <TouchableOpacity style={[{ marginTop: 30 }]} onPress={handlePress}>
          <View style={styles.ementaItem}>
            {ementa != '' ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ width: '70%' }}>
                  <Text style={[global.h3,{color:'white',fontSize:17}]}>{ementa.Carne} </Text>
                  <Text style={[global.p,{color:'#DEDEDE'}]}>Hoje almoças as {cantinaHorario}</Text>
                </View>
                <Icon2 name="chevron-small-right" size={40} color="white" style={{ marginRight: 15 }} />
              </View>
            ) : (
              <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 18 }}>A carregar ementa...</Text>
            )}
          </View>
        </TouchableOpacity>
        
        <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <Text style={[global.h2,{color:'white'}]}>Ementa</Text>
            {Object.entries(ementa).map(([key, value]) => (
              <Text key={key} style={styles.modalText}>
                <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{key}: </Text>
                {value}
              </Text>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
          </View>
        </Modal>

      </>
    
    );
  };
  
  const styles = StyleSheet.create({
    ementaItem: {
      height: 'auto',
      width: '100%',
      backgroundColor: '#9abebb',
      justifyContent: 'center',
      borderRadius: 10,
      zIndex: 2,
      padding:15,
     
    },
    modalContainer: {
      backgroundColor: '#9abebb',
      borderRadius: 10,
      padding:30,
    },
   
    modalText: {
      fontSize: 18,
      color: 'white',
      marginTop: 20,
    },
    centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 25,
    height: 25,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
})