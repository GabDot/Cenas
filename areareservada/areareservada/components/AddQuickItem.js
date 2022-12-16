import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View, TextInput, TouchableOpacity, } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AddQuickItem(props) {

    const handleItem = (value) => {
        props.addItem(value);

    }
    return (
        <TouchableOpacity onPress={() => handleItem()}>
            <View>
                <MaterialCommunityIcons name="plus" size={24} color="gray"></MaterialCommunityIcons>
            </View>
        </TouchableOpacity>


    )
}

const styles = StyleSheet.create({

})