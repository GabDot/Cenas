import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { global } from "../styles/globals";

export default function AgendaItem({agenda}) {
    return (
        <>
        <View style={[styles.color,{ backgroundColor: agenda.color }]}>
        
        </View>
        
        <Pressable style={styles.container}>
            <View style={styles.content}>
                <Text style={global.h2}>{agenda.title}</Text>
                <Text style={global.p}>{agenda.date} - {agenda.time} </Text>
                
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
        marginTop: 50,
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
        elevation: (Platform.OS === 'android') ? -1 : 0,
        width:290,
        marginTop:30,
        height:73,
        borderTopRightRadius:10,
        borderTopLeftRadius:10,



    }


})