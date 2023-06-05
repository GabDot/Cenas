import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { global } from '../styles/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AlertPreferenceModal = ({ visible, onClose }) => {
  const [alertPreference, setAlertPreference] = useState(null);

  useEffect(() => {
    const getAlertPreference = async () => {
      const preference = await AsyncStorage.getItem('alertPreference');
      setAlertPreference(preference);
    };
    getAlertPreference();
  }, []);

  const handleSelectPreference = async (preference) => {
    setAlertPreference(preference);
    await AsyncStorage.setItem('alertPreference', preference);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true}  animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
        <TouchableOpacity style={[styles.closeButton]} onPress={onClose}><Text>X</Text></TouchableOpacity>
          <Text style={global.h2}>Notificações</Text>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              alertPreference === 'A' && styles.submitButton,
            ]}
            onPress={() => handleSelectPreference('A')}
          >
            <Text  style={[
              styles.cancelButtonText,
              alertPreference === 'A' && styles.submitButtonText,
            ]}>No dia do evento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              alertPreference === 'B' && styles.submitButton,
            ]}
            onPress={() => handleSelectPreference('B')}
          >
            <Text  style={[
              styles.cancelButtonText,
              alertPreference === 'B' && styles.submitButtonText,
            ]}>Um dia antes do evento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              alertPreference === 'C' && styles.submitButton,
            ]}
            onPress={() => handleSelectPreference('C')}
          >
            <Text  style={[
              styles.cancelButtonText,
              alertPreference === 'C' && styles.submitButtonText,
            ]}>Dois dias antes do evento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    elevation: 5,

  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#9abebb',
    padding: 5,
    width: 300,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:10,


  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth:1,
    marginTop:10,

    borderColor:'#9abebb',
    padding: 5,
    width: 300,
    height: 50,
    marginRight: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButtonText: {
    color:'#9abebb',
  },closeButton: {
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

export default AlertPreferenceModal;