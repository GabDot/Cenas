import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from './screens/home';
import User from './screens/user';
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from 'react';
import { useFonts } from 'expo-font'
export default function App() {
  const Tab = createMaterialBottomTabNavigator();
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

    <NavigationContainer>
      <Tab.Navigator
        barStyle={{ backgroundColor: 'white' }}>
        <Tab.Screen name="Home" component={Home}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" color={color} size={26} />
            ),
          }} />
        <Tab.Screen name="User" component={User}
          options={{
            tabBarLabel: 'Eu',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-circle" color={color} size={26} />
            ),
          }} />
      </Tab.Navigator>
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',

  },
});