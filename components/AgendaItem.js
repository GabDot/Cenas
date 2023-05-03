import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { global } from "../styles/globals";
import moment from 'moment';
import 'moment/locale/pt-br'


export default function AgendaItem({ agenda, navigation }) {
    

    console.log(agenda.data);
    const date = moment(agenda.data, 'YYYY-MM-DD');
    moment.locale('pt-br');
    const formattedDate = date.format('dddd, D [de] MMMM [de] YYYY');
    const isCloseToDate = date.diff(moment(), 'days') < 1;
    function navigateToTabScreen(tabName) {
        navigation.navigate(tabName);
    }
    return (
        <>
            <Pressable style={styles.container} onPress={() => navigation.navigate('Agenda', { runFunction: true, selectedClickDate: agenda.data })}>
                <View style={[
                    styles.color,
                    { backgroundColor: isCloseToDate ? '#C7254E' : '#337AB7' },
                ]}>

                </View>
                <View style={styles.content}>
                    <Text style={global.h2}>{agenda.titulo}</Text>
                    <Text style={global.p}>{formattedDate}</Text>

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
        marginTop: 25,
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
    color: {
        position: 'absolute',
        zIndex: -1,
        elevation: -1,
        bottom: 20,
        width: 290,
        height: 65,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    }
})