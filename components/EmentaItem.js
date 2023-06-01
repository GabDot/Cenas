import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { global } from "../styles/globals";
import moment from 'moment';
import { useState } from "react";
import 'moment/locale/pt'; 
import { database } from '../firebase';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Entypo';

export default function EmentaItem({ementa}) {
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
                  <Text style={[global.h3,{color:'white',fontSize:17}]}>{ementa.ementa.menu.normal && typeof ementa.ementa.menu.normal === 'object' ? ementa.ementa.menu.normal['#text'] : ementa.ementa.menu.normal} </Text>
                  
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
            <View 
            style={{ marginTop: 10 }}>
            {ementa != '' ? (
              <>
              <Text
              style={[
                { marginBottom: 5, marginTop: 5 },
                global.h3,
                { color: 'white' },
              ]}
            >
              CARNE:
            </Text>
            <Text style={[global.p, { color: 'white' }]}>
              {ementa.ementa.menu.normal && typeof ementa.ementa.menu.normal === 'object' ? ementa.ementa.menu.normal['#text'] : ementa.ementa.menu.normal}
            </Text>
            <Text
              style={[
                { marginBottom: 5, marginTop: 5 },
                global.h3,
                { color: 'white' },
              ]}
            >
              PEIXE:
            </Text>
            <Text style={[global.p, { color: 'white' }]}>
              {ementa.ementa.menu.opcao && typeof ementa.ementa.menu.opcao === 'object' ? ementa.ementa.menu.opcao['#text'] : ementa.ementa.menu.opcao}
            </Text>
            <Text
              style={[
                { marginBottom: 5, marginTop: 5 },
                global.h3,
                { color: 'white' },
              ]}
            >
              DIETA:
            </Text>
            <Text style={[global.p, { color: 'white' }]}>
              {ementa.ementa.menu.dieta && typeof ementa.ementa.menu.dieta === 'object' ? ementa.ementa.menu.dieta['#text'] : ementa.ementa.menu.dieta}
            </Text>
            <Text
              style={[
                { marginBottom: 5, marginTop: 5 },
                global.h3,
                { color: 'white' },
              ]}
            >
              VEGETARIANO:
            </Text>
            <Text style={[global.p, { color: 'white' }]}>
              {ementa.ementa.menu.vegetariano && typeof ementa.ementa.menu.vegetariano === 'object' ? ementa.ementa.menu.vegetariano['#text'] : ementa.ementa.menu.vegetariano}
            </Text>
            <Text
              style={[
                { marginBottom: 5, marginTop: 5 },
                global.h3,
                { color: 'white' },
              ]}
            >
              SOBREMESA:
            </Text>
            <Text style={[global.p, { color: 'white' }]}>
              {ementa.ementa.menu.sobremesa && typeof ementa.ementa.menu.sobremesa === 'object' ? ementa.ementa.menu.sobremesa['#text'] : ementa.ementa.menu.sobremesa}
            </Text>
         
          </>
            ) : (
              <Text>Loading</Text>
            )}
</View>


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
      backgroundColor: '#D0247A',
      justifyContent: 'center',
      borderRadius: 10,
      zIndex: 2,
      padding:15,
     
    },
    modalContainer: {
      backgroundColor: '#D0247A',
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