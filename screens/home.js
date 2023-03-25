import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList, ScrollView} from 'react-native'
import { useEffect } from 'react';
import Header from '../components/Header';
import QuickNavItem from '../components/QuickNavItem';
import EventItem from '../components/EventItem';
import AgendaItem from '../components/AgendaItem';
import { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { global } from "../styles/globals";
import { auth } from '../firebase';
import { database } from '../firebase';
import SelectableQuickNav from "../components/SelectableQuickNav"
export default function Home({navigation, isLoggedIn, setIsLoggedIn}) {
    
    const [item, setItem] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const uid = auth.currentUser.uid
    const [username, setUsername] = useState('');
    const userRef = database.collection('users').doc(uid);
    const eventosRef = database.collection('eventos');
    useEffect(() => {
        const unsubscribe = loader()
        
        return () => unsubscribe;
      }, []);
      
    
    function loader(){
        const eventos = [];
  eventosRef.get().then((querySnapshot) => {
    querySnapshot.forEach((documentSnapshot) => {
      eventos.push(documentSnapshot.data());
    });
    setEventos(eventos);
  });
          userRef.get().then((doc) => {
            if (doc.exists) {
                const username = doc.data().nome;
                setUsername(username);
            
            } else {
            console.log('No user document found with ID:', uid);
            }
        }).catch((error) => {
            console.error('Error getting user document:', error);
        });
        console.log("database loaded")
    }
    const screens = [
        
        {
            name:"Notas",
            icon:"clipboard-list"
        },
        {
            name:"Ementa",
            icon:"silverware"
        },
        
        {
            name:"Notas",
            icon:"clipboard-list"
        },
        {
            name:"Ementa",
            icon:"silverware"
        },
    ]
    
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
    const submitHandler = (value, icon, color, route) => {
        setItem((prevItem) => {
            return [
                { name: value, key: Math.random().toString(), icon: icon, color: color, route: route }, ...prevItem
            ]
        })
    }
    const handleSignOut =() => {
        auth.signOut()
        setIsLoggedIn(false)
    }
    

    return (
        <View style={{flex:1}}>
            <Modal
                animationType="fade"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >

                <View style={[styles.QuickNavModal, {flex:1}]}>
                <FlatList
                        showsHorizontalScrollIndicator={false} 
                        numColumns={5}
                        data={screens}
                        renderItem={({ item }) => (
                            <SelectableQuickNav screens={item} submitHandler={submitHandler} setModalVisible={setModalVisible} modalVisible={modalVisible} />
                        )}
                    />
                    <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => { setModalVisible(!modalVisible) }}
                    >
                        <MaterialCommunityIcons name='window-close' color='#A4A4A4' size={50} />
                    </Pressable>
                </View>
            </Modal>
            <Header></Header>
            <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.title}>
                
                    <Text style={global.h1}>Bem vindo,</Text>
                    <Text style={global.p}>{username}</Text>
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
                        data={eventos}
                        renderItem={({ item }) => (
                            <EventItem eventos={item}/>
                        )} />
                        <Text style={global.h2}>A tua agenda</Text>
                <FlatList
                        
                        showsHorizontalScrollIndicator={false} 
                        horizontal={true} 
                        contentContainerStyle={[styles.eventos,{ flexDirection: "row" }]}
                        data={agenda}
                        renderItem={({ item }) => (
                            <AgendaItem agenda={item}/>
                        )} />
                <TouchableOpacity onPress={handleSignOut} ><Text style={global.h2}>Sign out</Text></TouchableOpacity>

                

            </View>
            </ScrollView>
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
        flexGrow:1,
    },
    eventos: {
        marginTop: 10,
        opacity: 1,
        alignItems: 'center'

    },
    QuickNavModal:{
        flexDirection: 'column', 
        flexGrow: 1,            // all the available vertical space will be occupied by it
        justifyContent: 'space-between',
        padding:25

    },
    buttonClose:{
        alignSelf:'center'
        
        
    }
});