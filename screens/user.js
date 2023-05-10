import { View, Text,StyleSheet, ScrollView,Image,RefreshControl,TouchableOpacity } from 'react-native'
import { useState,useEffect } from 'react';
import Header from '../components/Header';
import { global } from '../styles/globals';
import { auth } from '../firebase';
import { database } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
export default function User({isLoggedIn,setIsLoggedIn}) {
    const uid = auth.currentUser.uid
    const userRef = database.collection('users').doc(uid);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState([]);
    const [isConnected, setIsConnected] = useState();
    const handleSignOut = () => {
        auth.signOut()
        setIsLoggedIn(false);
      }
    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout));
      }
        const onRefresh = () => {
          setRefreshing(true);
          // Call a function to fetch new data here
          wait(2000).then(() => setRefreshing(false));
        };
        async function loadDataFromStorage(){
            const userData = await AsyncStorage.getItem('user');
            
            if (userData !== null) {
                setUser(JSON.parse(userData));
                
              }
          }
      useEffect( () => {
        const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
          console.log(isConnected);
          setIsConnected(state.isConnected);
    
        });
        
        if(isConnected){
            userRef.onSnapshot((doc) => {
                const user = []
                if (doc.exists) {
                  user.push(doc.data())
                  console.log(user)
                  setUser(user);
                  AsyncStorage.setItem('user', JSON.stringify(user));
                  if (user.length > 0) {
                    setUser(user);
                    AsyncStorage.setItem('user', JSON.stringify(user));
                  }
                  else{
                      setUser([]);
                        AsyncStorage.removeItem('user');
                  }
                  
                 
                }})}
                else{
                    loadDataFromStorage()

                }
                
          return () => {
            unsubscribeNetInfo();
          };
      },[isConnected,refreshing])
    return (
        user && user[0] && 
        <View style={{flex:1}}>
            <Header></Header>
            <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
                <View style={styles.profilePictureContainer}>
                        <Image
                            source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/areareservada-b5d8c.appspot.com/o/pfp.JPG?alt=media&token=ab26990b-e692-43eb-851c-14fa7336a8d3' }}
                            style={styles.profilePicture}
                        />
                        <Text style={[global.h2,{marginTop:10,marginBottom:20}]}>{user[0]['nome']}</Text>
                    </View>
               <View style={styles.body}>
                   <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                   <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>Número</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{user[0]['numero']}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>B.Identidade</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{user[0]['bi']}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>D.Nascimento</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{user[0]['dnascimento']}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>Turma</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{user[0]['turma']}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>Curso</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{user[0]['curso']}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>Sexo</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{user[0]['sexo']}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[global.p,{fontSize:18,marginBottom:5}]}>Enc.Educação</Text>
                        <Text style={[global.h3,{fontSize:18}]}>{user[0]['enceducacao']}</Text>
                    </View>
                </ScrollView>
                <TouchableOpacity style={{justifyContent:'center',alignItems:'center',marginVertical:10,backgroundColor:'#C7254E',padding:10,borderRadius:10}} onPress={handleSignOut} ><Text style={global.h3}>Sign out</Text></TouchableOpacity>
                </View>
                

            </ScrollView>
 
        </View>
        
    )
}

const styles = StyleSheet.create({
    container:{
        height:'auto',
        backgroundColor:'white',
        padding:15,
        borderRadius:10,
    },
    body:{
        marginHorizontal:18,
    },
   
    section:{
        marginBottom:20,
    },profilePictureContainer: {
        marginTop:10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      profilePicture: {
        width: 150,
        height: 150,
        borderRadius: 100,
        resizeMode:'contain'
      }

})
