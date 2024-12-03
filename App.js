import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Homescreen from './Pages/Homescreen';
import CreateUser from './Pages/CreateUser';
//import Login from './Pages/Login';




const Stack  = createStackNavigator();


const App = () => {
  return (
    <NavigationContainer> 
      <Stack.Navigator initialRouteName='Home'screenOptions={{headerShown:false}}>
        <Stack.Screen name='Home' component={Homescreen}/> 
        <Stack.Screen name='CreateUser' component={CreateUser}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
