import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { global } from "../styles/globals";
import moment from 'moment';

export default function AgendaItem({agenda}) {
    const date = moment(agenda.data, 'DD/MM - HH:mm');
    const isCloseToDate = date.diff(moment(), 'days') <= 1;
    return (
        <>
        
        
        <Pressable style={styles.container}>
            <View style={[
          styles.color,
          { backgroundColor: isCloseToDate ? '#C7254E' : '#337AB7' },
        ]}>
        
        </View>
            <View style={styles.content}>
                <Text style={global.h2}>{agenda.titulo}</Text>
                <Text style={global.p}>{agenda.data}</Text>
                
            </View>
        </Pressable>
        </>
    )
}
const styles = StyleSheet.create({
    content: {
        height: 72,
        backgroundColor: 'white',
        borderRadius: 10,
        marginRight: 17,
        marginTop: 30,
        zIndex: 2,
        paddingHorizontal: 9,
        paddingVertical: 6,
        
    },
    container: {
        width: 309,
    },
    image: {
        position: 'absolute',
        height: 70,
        width: 290,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        zIndex: 1
    },
    color:{
        position:'absolute',
        zIndex:-1,
        elevation: -1,
        bottom:20,
        width:290,
        height:73,
        borderTopRightRadius:10,
        borderTopLeftRadius:10,



    }


})