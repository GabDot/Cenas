import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState,useCallback } from "react";
import { global } from "../styles/globals";
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Entypo';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons'
import Modal from "react-native-modal";
import { SlideInLeft, SlideOutLeft } from "react-native-reanimated";

export default function EventItem({ eventos }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [webViewRef, setWebViewRef] = useState(null);
    const handleWebViewRef = useCallback((ref) => {
        setWebViewRef(ref);
    }, []);
    return (
        <>
            <Pressable style={styles.container} onPress={() => setModalVisible(true)}>
                <Image source={{ uri: eventos.image}} style={styles.image}></Image>
                <View style={styles.content}>
                    <Text style={global.h3}>{eventos.title}</Text>
                    <Text style={global.p}>{eventos.description}</Text>
                </View>
            </Pressable>
            
            <Modal
                animationIn="slideInRight"
                animationOut="slideOutRight"
                transparent={true}
                isVisible={modalVisible}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                hasBackdrop={true}
                onBackButtonPress={() => webViewRef.goBack()}
               
        

            >

                 <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => webViewRef.goBack()}>
                        <Icon name="chevron-small-left" color={'white'} size={40}></Icon>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => webViewRef.goForward()}>
                    <Icon name="chevron-small-right" color={'white'} size={40}></Icon>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => webViewRef.reload()}>
                    <Icon2 name="reload" color={'white'} size={30}></Icon2>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButon} onPress={() => setModalVisible(false)}>
                    <Icon2 name="close" color={'white'} size={30}></Icon2>
                    </TouchableOpacity>
                </View>
   
                 <WebView
                     ref={handleWebViewRef}
                    source={{ uri: eventos.link }}
                />
                
                
            </Modal>
           
        </>
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
        marginTop: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        zIndex: 1
    },modalHeader: {
        flexDirection: 'row',
        alignItems:'center',
        paddingBottom: 20
    },
    closeButon: {
        position: 'absolute',
        left:330,
        paddingBottom:20
    }


})