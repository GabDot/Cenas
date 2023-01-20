import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './screens/home';
import User from './screens/user';
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from 'react';
import { useFonts } from 'expo-font'
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

  if (!fontsLoaded) {
    return undefined
  }
  else {
    SplashScreen.hideAsync();
  }

  return (
    <>
    <StatusBar translucent></StatusBar>
    

    <NavigationContainer>
      <Tab.Navigator
        
        barStyle={[styles.navbar,{ backgroundColor: 'white' }]}
        screenOptions={{
          tabBarActiveTintColor: '#1E1E1E',
          headerShown: false,
          tabBarShowLabel: false
        }}>
        <Tab.Screen name="Hoe" component={Home}
          options={{
            
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" color={color} size={38} />
            ),
          }} />
        <Tab.Screen name="User" component={User}
          options={{
            
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="clipboard-list" color={color} size={38} />
            ),
          }} />
          <Tab.Screen name="Notas" component={User}
          options={{
            
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-circle" color={color} size={38} />
            ),
          }} />
          <Tab.Screen name="Ementa" component={User}
          options={{
            
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="silverware" color={color} size={38} />
            ),
          }} />
          <Tab.Screen name="Mais" component={User}
          options={{
            
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="dots-horizontal" color={color} size={38} />
            ),
          }} />
      </Tab.Navigator>
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