import React from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Homescreen from './Pages/Homescreen';
import CreateUser from './Pages/CreateUser';
//import Login from './Pages/Login';
import CreateListing from './Pages/MitLejemål';



const Stack  = createStackNavigator();


const App = () => {
  let [fontsLoaded] = useFonts({
    'gabarito': require('./assets/Gabarito.ttf'),
  });
  if (!fontsLoaded) {
    return <AppLoading />;
  }
  return (
    <NavigationContainer> 
      <Stack.Navigator initialRouteName='Home' screenOptions={{headerShown:false}}>
        <Stack.Screen name='Home' component={Homescreen}/> 
        <Stack.Screen name='CreateUser' component={CreateUser}/>
        <Stack.Screen name='CreateListing' component={CreateListing}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
