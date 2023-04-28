import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { global } from "../styles/globals";

export default function EventItem({eventos}) {
    return (
        <Pressable style={styles.container}>
            <Image source={{uri: eventos.imagem}} style={styles.image}></Image>
            <View style={styles.content}>
                <Text style={global.h2}>{eventos.titulo}</Text>
                <Text style={global.p}>{eventos.desc}</Text>
            </View>
        </Pressable>
    )
}
const styles = StyleSheet.create({
    content: {

        height: 80,
        backgroundColor: 'white',
        borderRadius: 10,
        marginRight: 17,
        marginTop: 90,
        zIndex: 2,
        paddingHorizontal: 9,
        paddingVertical: 6
    },
    container: {
        width: 309,
    },
    image: {
        position: 'absolute',
        height: 100,
        width: 290,
        marginTop:10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        zIndex: 1
    }


})