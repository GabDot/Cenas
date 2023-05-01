import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screens/home';
import User from './screens/user';
import Login from './screens/login';
import Agenda from './screens/agenda';
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState, createContext } from 'react';
import { useFonts } from 'expo-font'
import AgendaScreen from './screens/agenda';
import { LogBox } from 'react-native';

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
          tabBarShowLabel: false,
          tabBarStyle: { height: 80 },
        }}>
          <Tab.Screen name="Home" 
          options={{
            
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" color={color} size={38} />
            ),
          }} >{(props) => <Home {...props} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}</Tab.Screen>
        <Tab.Screen name="Notas" component={User}
          options={{
            
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="clipboard-list" color={color} size={38} />
            ),
          }} />
          <Tab.Screen name="User" component={User}
          options={{
            
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-circle" color={color} size={38} />
            ),
          }} />
           <Tab.Screen 
            name="Agenda" 
            component={AgendaScreen} 
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="calendar" color={color} size={38} />
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: e => {
                e.preventDefault();
                navigation.navigate('Agenda', { runFunction: false });
              },
            })}
            />
          <Tab.Screen name="Mais" component={User}
          options={{
            
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="dots-horizontal" color={color} size={38} />
            ),
          }} />
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
    height:92,
    alignContent:'center',
    justifyContent:'center',

  }
});