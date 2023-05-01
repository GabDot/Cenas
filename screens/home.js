import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList, ScrollView, Button } from 'react-native'
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import QuickNavItem from '../components/QuickNavItem';
import EventItem from '../components/EventItem';
import AgendaItem from '../components/AgendaItem';
import { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { global } from "../styles/globals";
import { auth } from '../firebase';
import { database } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SelectableQuickNav from "../components/SelectableQuickNav"
import NetInfo from '@react-native-community/netinfo';

export default function Home({ navigation, isLoggedIn, setIsLoggedIn }) {

  const [item, setItem] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [ementa, setEmenta] = useState([]);
  const [cantinaHorario, setCantinaHorario] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const uid = auth.currentUser.uid
  const [username, setUsername] = useState('');
  const [turma, setTurma] = useState('');
  const userRef = database.collection('users').doc(uid);
  const eventosRef = database.collection('eventos');
  const agendaRef = database.collection('agenda');
  const ementaRef = database.collection('ementa');
  const agendaPRef = database.collection('users').doc(uid).collection('agendaP')
  const [agendaP, setAgendaP] = useState([])
  const cantinaHorarioRef = database.collection('cantinahorario');
  const [isConnected, setIsConnected] = useState();
  const [loaded, setLoaded] = useState(false);


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function formatDate(timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  async function loadDataFromStorage() {
    const eventosData = await AsyncStorage.getItem('eventos');
    const agendaData = await AsyncStorage.getItem('agenda');
    const usernameData = await AsyncStorage.getItem('username');
    const ementaData = await AsyncStorage.getItem('ementa');
    const agendaPData = await AsyncStorage.getItem('agendaP')
    console.log(agendaPData);
    if (eventosData !== null) {
      setEventos(JSON.parse(eventosData));
    }
    if (agendaData !== null) {
      setAgenda(JSON.parse(agendaData));

    }
    if (usernameData !== null) {
      setUsername(usernameData);
    }
    if (ementaData !== null) {
      setEmenta(JSON.parse(ementaData));
    }
    if (agendaPData !== null) {
      setAgendaP(JSON.parse(agendaPData));
    }

  }
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);

    });
    console.log(isConnected)
    loadDataFromStorage();

    if (isConnected && !loaded) {

      setLoaded(true);
      cantinaHorarioRef.get().then((querySnapshot) => {
        const cantinaHorario = [];
        querySnapshot.forEach((documentSnapshot) => {
          cantinaHorario.push(documentSnapshot.data());
        });
        if (cantinaHorario.length > 0) {
          setCantinaHorario(cantinaHorario);

          AsyncStorage.setItem('cantinaHorario', JSON.stringify(cantinaHorario));
        }
      });

      eventosRef.get().then((querySnapshot) => {
        const eventos = [];
        querySnapshot.forEach((documentSnapshot) => {
          eventos.push(documentSnapshot.data());
        });
        if (eventos.length > 0) {
          setEventos(eventos);

          AsyncStorage.setItem('eventos', JSON.stringify(eventos));
        }
      });
      ementaRef.get().then((querySnapshot) => {
        const ementa = [];

        querySnapshot.forEach((documentSnapshot) => {
          const dia = documentSnapshot.data().dia;
          const formattedDia = formatDate(dia);
          const restOfData = documentSnapshot.data();
          delete restOfData.dia;
          ementa.push({ dia: formattedDia, ...restOfData });
        });

        if (ementa.length > 0) {
          setEmenta(ementa);
          AsyncStorage.setItem('ementa', JSON.stringify(ementa));
        }
      });


      userRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            const username = doc.data().nome;
            const turma = doc.data().turma;
            setTurma(turma)
            setUsername(username);
            AsyncStorage.setItem('turma', turma);
            AsyncStorage.setItem('username', username);
            if (turma) {
              agendaRef.doc(turma).collection('agenda')
                .get()
                .then((agendaDoc) => {
                  const agenda = []
                  agendaDoc.forEach((document) => {
                    const titulo = document.data().titulo;
                    const data = document.data().data;
                    const formattedDate = formatDate(data);
                    const agendaItem = { data: formattedDate, titulo };

                    if (new Date(formattedDate) >= new Date()) {
                      console.log(formattedDate)
                      console.log(new Date())
                      agenda.push(agendaItem);
                    } else {
                      agendaRef.doc(turma).collection('agenda').doc(document.id).delete()
                        .then(() => {
                          console.log('Document successfully deleted from Firebase Firestore');
                        })
                        .catch((error) => {
                          console.error('Error deleting document from Firebase Firestore:', error);
                        });
                    }
                  });

                  setAgenda(agenda);

                  if (agenda.length > 0) {
                    AsyncStorage.setItem('agenda', JSON.stringify(agenda));
                  } else {
                    setAgenda([]);
                    AsyncStorage.removeItem('agenda');
                  }
                })
                .catch((error) => {
                  console.error('Error getting agenda document:', error);
                });
            }
          } else {
            console.log('No user document found with ID:', uid);
          }
        })
        .catch((error) => {
          console.error('Error getting user document:', error);
        });
      agendaPRef
        .get()
        .then((agendaDoc) => {
          const agendaP = []
          const now = new Date()
          agendaDoc.forEach((document) => {
            const titulo = document.data().titulo;
            const data = document.data().data;
            const id = document.data().id;

            if (new Date(data) < now) {
              // delete document if date is before today
              document.ref.delete()
            } else {
              agendaP.push({ data: data, titulo, id });
            }
          });
          setAgendaP(agendaP);

          if (agendaP.length > 0) {
            console.log(agendaP.length)
            AsyncStorage.setItem('agendaP', JSON.stringify(agendaP));
          } else {
            console.log(agendaP.length)
            setAgendaP([]);
            AsyncStorage.removeItem('agendaP');
          }
        })
        .catch((error) => {
          console.error('Error getting agenda document:', error);
        });

      agendaPRef
        .onSnapshot((agendaDoc) => {
          const agendaP = []
          agendaDoc.forEach((document) => {
            const titulo = document.data().titulo;
            const data = document.data().data;
            const id = document.data().id;
            agendaP.push({ data: data, titulo, id });
          });
          setAgendaP(agendaP);

          if (agendaP.length > 0) {
            console.log(agendaP.length)
            AsyncStorage.setItem('agendaP', JSON.stringify(agendaP));
          }
          else {
            console.log(agendaP.length)
            console.log("trigger 2")
            setAgendaP([]);
            AsyncStorage.removeItem('agendaP');
          }
        })

      cantinaHorarioRef.onSnapshot((querySnapshot) => {
        const cantinaHorario = [];
        querySnapshot.forEach((documentSnapshot) => {
          cantinaHorario.push(documentSnapshot.data());
        });
        if (cantinaHorario.length > 0) {
          setCantinaHorario(cantinaHorario);
          AsyncStorage.setItem('cantinaHorario', JSON.stringify(cantinaHorario));
        }
      });

      eventosRef.onSnapshot((querySnapshot) => {
        const eventos = [];
        querySnapshot.forEach((documentSnapshot) => {
          eventos.push(documentSnapshot.data());
        });
        if (eventos.length > 0) {
          setEventos(eventos);
          AsyncStorage.setItem('eventos', JSON.stringify(eventos));
        }
      });

      ementaRef.onSnapshot((querySnapshot) => {
        const ementa = [];
        querySnapshot.forEach((documentSnapshot) => {
          const dia = documentSnapshot.data().dia;
          const formattedDia = formatDate(dia);
          const restOfData = documentSnapshot.data();
          delete restOfData.dia;
          ementa.push({ dia: formattedDia, ...restOfData });
        });
        if (ementa.length > 0) {
          setEmenta(ementa);
          AsyncStorage.setItem('ementa', JSON.stringify(ementa));
        }
      });

      userRef.onSnapshot((doc) => {
        if (doc.exists) {
          const username = doc.data().nome;
          const turma = doc.data().turma;
          setTurma(turma);
          setUsername(username);
          AsyncStorage.setItem('turma', turma);
          AsyncStorage.setItem('username', username);
          if (turma) {
            agendaRef.doc(turma).collection('agenda')
              .onSnapshot((agendaDoc) => {
                const agenda = []
                agendaDoc.forEach((document) => {
                  const titulo = document.data().titulo;
                  const data = document.data().data;

                  agenda.push({ data: formatDate(data), titulo });
                });
                setAgenda(agenda);
                if (agenda.length > 0) {
                  AsyncStorage.setItem('agenda', JSON.stringify(agenda));
                } else {
                  setAgenda([]);
                  AsyncStorage.removeItem('agenda');
                }
              })

          }
        } else {
          console.log('No user document found with ID:', uid);
        }
      });


      console.log('database loaded');
    }


    return () => {
      unsubscribeNetInfo();
    };
  }, [loaded, isConnected]);



  const screens = [

    {
      name: "Notas",
      icon: "clipboard-list"
    },
    {
      name: "Ementa",
      icon: "silverware"
    },

    {
      name: "Notas",
      icon: "clipboard-list"
    },
    {
      name: "Ementa",
      icon: "silverware"
    },
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
  const handleSignOut = () => {
    auth.signOut()
    setIsLoggedIn(false)
  }



  return (

    <View style={{ flex: 1 }}>



      <Header></Header>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.title}>

            <Text style={global.h1}>Bem vindo,</Text>
            <Text style={global.p}>{username}</Text>
          </View>

          <Text style={[{ marginTop: 10 }, global.h2]}>Agenda</Text>
          {agenda.length === 0 && agendaP.length === 0 ?
            <Text style={[{ marginTop: 10 }, global.p]}>Não tens itens na agenda</Text>

            : <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              contentContainerStyle={[styles.eventos, { flexDirection: "row" }]}
              data={[...agenda, ...agendaP].sort((a, b) => a.data.localeCompare(b.data))}
              renderItem={({ item }) => (
                <AgendaItem agenda={item} navigation={navigation} />
              )}
            />
          }
          <Text style={[{ marginTop: 30 }, global.h2]}>Eventos</Text>
          <FlatList

            showsHorizontalScrollIndicator={false}
            horizontal={true}
            contentContainerStyle={[styles.eventos, { flexDirection: "row" }]}
            data={eventos}
            renderItem={({ item }) => (
              <EventItem eventos={item} />
            )} />


          <View style={[{ marginTop: 30 }, styles.ementaContainer]}>
            {ementa.map((item, index) => (
              <View key={item.dia} style={styles.ementaItem}>

                <Text style={[{ color: 'white', fontSize: 18 }, global.p]}>
                  <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 18 }}>{item.pratoC}</Text>
                </Text>

              </View>
            ))}
          </View>
          <TouchableOpacity style={{ marginTop: 30 }} onPress={handleSignOut} ><Text style={global.h2}>Sign out</Text></TouchableOpacity>



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
    flexGrow: 1,
  },
  eventos: {

    opacity: 1,
    alignItems: 'center'

  },
  QuickNavModal: {
    flexDirection: 'column',
    flexGrow: 1,            // all the available vertical space will be occupied by it
    justifyContent: 'space-between',
    padding: 25

  },
  buttonClose: {
    alignSelf: 'center'


  },
  ementaItem: {
    height: 75,
    width: '100%',
    backgroundColor: '#D0247A',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 10,
    zIndex: 2,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  ementaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});