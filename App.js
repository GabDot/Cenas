import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, RefreshControl } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons'
import Feather from 'react-native-vector-icons/Feather'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screens/home';
import User from './screens/user';
import Login from './screens/login';
import Ementa from './screens/ementa'
import Agenda from './screens/agenda';
import Classificacoes from './screens/classificacoes'
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState, createContext } from 'react';
import { useFonts } from 'expo-font'

import { LogBox } from 'react-native';
import { global } from './styles/globals';

LogBox.ignoreAllLogs();


export default function App() {
  const Tab = createBottomTabNavigator();
  const [fontsLoaded] = useFonts({
    'sans-bold': require('./assets/fonts/PublicSans-Bold.ttf'),
    'sans-medium': require('./assets/fonts/PublicSans-Medium.ttf'),
    'sans-regular': require('./assets/fonts/PublicSans-Regular.ttf'),
    'sans-semibold': require('./assets/fonts/PublicSans-SemiBold.ttf')
  })

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();

  }, []);
  const[isLoggedIn,setIsLoggedIn] = useState(false)
  

  if (!fontsLoaded) {
    return undefined
  }
  else {
    SplashScreen.hideAsync();
  }
  const Stack = createStackNavigator();
  return (
    <>
    <StatusBar style='light' backgroundColor='#9A9DBE'></StatusBar>

    <NavigationContainer>
    {isLoggedIn ? (
        <Tab.Navigator  barStyle={[styles.navbar,{ backgroundColor: 'white' }]}
        screenOptions={{
          tabBarActiveTintColor: '#1E1E1E',
          headerShown: false,
          tabBarHideOnKeyboard:true, 
          tabBarLabelStyle:[global.p,{fontSize:11,marginBottom:5}],
          tabBarIconStyle:{marginTop:10},
          tabBarStyle: { height: 65 },
        }}>
          <Tab.Screen name="Home" 
          options={{
            title:'Início',
            tabBarIcon: ({ color }) => (
              <Octicons name="home" color={color} size={30} />
              
            ),
            
          }} >{(props) => <Home {...props} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}</Tab.Screen>
        <Tab.Screen name="Classificacoes" component={Classificacoes}
          options={{
            title:'Classificações',
            tabBarIcon: ({ color }) => (
              <AntDesign name="book" color={color} size={30} />
            ),
          }} />
        
           <Tab.Screen 
            name="Agenda" 
            component={Agenda} 
            options={{
              tabBarIcon: ({ color }) => (
                <Feather name="calendar" color={color} size={30} />
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: e => {
                e.preventDefault();
                navigation.navigate('Agenda', { runFunction: false });
              },
            })}
            />
          <Tab.Screen name="Ementa" component={Ementa}
          options={{
            
            tabBarIcon: ({ color }) => (
              <Icon name="restaurant-outline" color={color} size={30} />
            ),
          }} />
           <Tab.Screen
  name="User"
  options={{
    title:'Utilizador',
    tabBarIcon: ({ color }) => (
      <Ionicons name="person-outline" color={color} size={30} />
    ),
  }}
>
  {(props) => <User {...props} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
</Tab.Screen>
          
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
           <Stack.Screen name="Login" options={{ headerShown: false }}>
    {(props) => <Login {...props} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
  </Stack.Screen>
        </Stack.Navigator>
      )}
       </NavigationContainer>
      
       
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',

  },
  navbar:{
    width:'100%',
    alignContent:'center',
    justifyContent:'center',

  }
});