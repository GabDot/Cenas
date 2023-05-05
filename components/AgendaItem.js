import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { global } from "../styles/globals";
import moment from 'moment';
import 'moment/locale/pt-br'
import { useEffect, useLayoutEffect, useState } from "react";


export default function AgendaItem({ agenda, navigation }) {
    
const [formattedDate, setFormattedDate] = useState('')
const [isCloseToDate,setIsCloseToDate] = useState()
    useEffect(() =>{
        
        const date = moment(agenda.data, 'YYYY-MM-DD');
        const isCloseToDate = date.diff(moment(), 'days') < 1;
        setIsCloseToDate(isCloseToDate)
        moment.locale('pt-br');
        const formattedDate = date.format('dddd, D [de] MMMM [de] YYYY');
        setFormattedDate(formattedDate)

    },[agenda.data, formattedDate, isCloseToDate])
    
    
    return (
        <>
            <Pressable style={styles.container} onPress={() => navigation.navigate('Agenda', { runFunction: true, selectedClickDate: agenda.data })}>
                <View style={[
                    styles.color,
                    { backgroundColor: isCloseToDate ? '#C7254E' : '#337AB7' },
                ]}>

                </View>
                <View style={styles.content}>
                    <Text style={global.h3}>{agenda.titulo}</Text>
                    <Text style={global.p}>{formattedDate}</Text>

                </View>
            </Pressable>
        </>
    )
}
const styles = StyleSheet.create({
    content: {
        height: 'auto',
        backgroundColor: 'white',
        borderRadius: 10,
        marginRight: 17,
        marginTop: 25,
        zIndex: 2,
        padding:16
        

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
    color: {
        position: 'absolute',
        zIndex: -1,
        elevation: -1,
        bottom: 20,
        width: 290,
        height: 70,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    }
})