import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import Header from '../components/Header';
import QuickNavItem from '../components/QuickNavItem';
import EventItem from '../components/EventItem';
import AgendaItem from '../components/AgendaItem';
import { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { global } from "../styles/globals";
export default function Home() {
    const [item, setItem] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const events = [
        {
            title:"Corta mato 2022/2023",
            description:"Inscreve te no corta mato",
            image:require("../assets/CORTAMATO22.jpg"),
        },
        {
            title:"Palestra da RTP",
            description:"Não vamos ter aulas pra ter uma palestra",
            image:require("../assets/CORTAMATO22.jpg")
        }
    ]
    const agenda = [
        {
            title:"Teste de matemática",
            date:"31 de janeiro",
            time:"13:55",
            color:"#C7254E"
        },
        {
            title:"Teste de Programação",
            date:"15 de fevereiro",
            time:"8:30",
            color:"#337AB7"
        }

    ]
    const deleteItem = (name, key) => {
        setItem((prevItem) => {
            return prevItem.filter(item => item.key != key)
        })



    }
    const submitHandler = (value, icon, color) => {
        setItem((prevItem) => {
            return [
                { name: value, key: Math.random().toString(), icon: icon, color: color }, ...prevItem
            ]
        })
    }

    return (
        <View >
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >

                <View style={styles.centeredView}>
                    <Pressable onPress={() => { setModalVisible(!modalVisible); submitHandler("coiso", "aa", 'orange') }}>
                        <Text>Coiso</Text>
                    </Pressable>
                    <Pressable onPress={() => { setModalVisible(!modalVisible); submitHandler("outro\ncoiso", 'bb', 'green') }}>
                        <Text>Outro Coiso</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => { setModalVisible(!modalVisible) }}
                    >
                        <Text style={styles.textStyle}>Fechar</Text>
                    </Pressable>
                </View>
            </Modal>
            <Header></Header>
            <View style={styles.container}>
                <View style={styles.title}>
                    <Text style={global.h1}>Bem vindo,</Text>
                    <Text style={global.p}>Gabriel Silva</Text>
                </View>
                <Text style={global.h2}>Navegação rápida</Text>
                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} contentContainerStyle={styles.QuickNav}>
                    <FlatList
                        
                        contentContainerStyle={{ flexDirection: "row" }}
                        data={item}
                        renderItem={({ item }) => (
                            <QuickNavItem item={item} deleteItem={deleteItem} />
                        )} />
                    <TouchableOpacity style={{ marginBottom: 16 }} onPress={() => setModalVisible(true)}><MaterialCommunityIcons name='plus' size={40} color='gray'></MaterialCommunityIcons></TouchableOpacity>

                </ScrollView>
                <Text style={global.h2}>Eventos</Text>
                <FlatList
                        
                        showsHorizontalScrollIndicator={false} 
                        horizontal={true} 
                        contentContainerStyle={[styles.eventos,{ flexDirection: "row" }]}
                        data={events}
                        renderItem={({ item }) => (
                            <EventItem events={item}/>
                        )} />
                        <Text style={global.h2}>Agenda</Text>
                <FlatList
                        showsHorizontalScrollIndicator={false} 
                        horizontal={true} 
                        contentContainerStyle={[styles.eventos,{ flexDirection: "row" }]}
                        data={agenda}
                        renderItem={({ item }) => (
                            <AgendaItem agenda={item}/>
                        )} />

                

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 20
    },
    QuickNav: {
        marginTop: 10,
        marginBottom: 10,
        opacity: 1,
        alignItems: 'center'

    },
    container: {
        paddingHorizontal: 18,
    },
    eventos: {
        marginTop: 10,
        opacity: 1,
        alignItems: 'center'

    }
});