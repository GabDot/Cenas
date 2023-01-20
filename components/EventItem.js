import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { global } from "../styles/globals";

export default function EventItem() {
    return (
        <Pressable style={styles.container}>
            <Image source={require("../assets/CORTAMATO22.jpg")} style={styles.image}></Image>
            <View style={styles.content}>
                <Text style={global.h2}>Corta mato 2022/2023</Text>
                <Text style={global.p}>As inscrições decorrem até ao dia 27 de novembro de 2022.</Text>
            </View>
        </Pressable>
    )
}
const styles = StyleSheet.create({
    content: {

        height: 97,
        backgroundColor: 'white',
        borderRadius: 10,
        marginRight: 17,
        marginTop: 50,
        zIndex: 2,
        paddingHorizontal: 9,
        paddingVertical: 6
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
    }


})