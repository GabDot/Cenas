import React, { useState } from 'react';
import { View, Modal, Text, Button,StyleSheet,TouchableOpacity } from 'react-native';
import { global } from '../styles/globals';

export default function ErrorModal  ({visible, onClose, message}) {

    return(
        <Modal
        animationType='fade'
        visible={visible}
        onRequestClose={onClose}
        transparent={true}
      >
        <View style={styles.modalContainer}>

          <View style={styles.modalContent}>
            <TouchableOpacity style={[styles.closeButton]} onPress={onClose}>
              <Text style={global.p}>X</Text>
            </TouchableOpacity>
            <Text style={global.p}>{message}</Text>
          </View>
        </View>
      </Modal>

    )
}
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
        padding: 35,
        elevation: 5,
    
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
})
