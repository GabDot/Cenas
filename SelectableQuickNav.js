import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { global } from "../styles/globals";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SelectableQuickNav({screens, submitHandler,setModalVisible,modalVisible}) {
 

    return (
        

            
            <TouchableOpacity onPress={() => {setModalVisible(!modalVisible); submitHandler(screens.name, screens.icon , 'white')} }>
                <View style={[{ backgroundColor: 'lightgray' }, styles.container]} >


                <MaterialCommunityIcons name={screens.icon} color='gray' size={50} />

                </View>
                <Text style={[global.p2, { textAlign: 'center', marginRight: 5 }]}>{screens.name}</Text>
            </TouchableOpacity>
      
    )
}
const styles = StyleSheet.create({
    container: {

        width: 64,
        height: 67,
        borderRadius: 10,
        marginRight: 5,
        justifyContent:"center",
        alignItems:'center'
    }

})