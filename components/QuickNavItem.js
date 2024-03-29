import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { global } from "../styles/globals";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
export default function QuickNavItem({ item, deleteItem }) {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >

                <View >
                    <Pressable onPress={() => { setModalVisible(!modalVisible); deleteItem(item.name, item.key) }}>
                        <Text>Apagar</Text>
                    </Pressable>
                    <Pressable onPress={() => { setModalVisible(!modalVisible) }}>
                        <Text>Cancelar</Text>
                    </Pressable>

                </View>
            </Modal>
            <TouchableOpacity  onPress={() => navigation.navigate(item.route)} onLongPress={() => { setModalVisible(true) }}>
                <View style={[{ backgroundColor: item.color }, styles.container]} >


                <MaterialCommunityIcons name={item.icon} color='#A4A4A4' size={60} />

                </View>
                <Text style={[global.p, { textAlign: 'center', marginRight: 5 }]}>{item.name}</Text>
            </TouchableOpacity>
        </>
    )
}
const styles = StyleSheet.create({
    container: {

        width: 64,
        height: 67,
        borderRadius: 10,
        marginRight: 5,
        justifyContent:'center',
        alignItems:'center'
    }
    
        

})