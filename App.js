import React from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Homescreen from './Pages/Homescreen';
import CreateUser from './Pages/CreateUser';
import Login from './Pages/Login';
import CreateListing from './Pages/CreateListing';
import UserImagePicker from './Pages/UserImagePicker';
import MyProfile from "./Pages/MyProfile";
import DetailedAboutYou from "./Pages/DetailedAboutYou";
import MyListing from './Pages/MyListing';
import EditListing from './Pages/EditListing';
import DetailedListing from './Pages/DetailedListing';
import EditProfile from "./Pages/EditProfile";
import Swipe from './Pages/Swipe';
import AllListings from './Pages/AllListings';
import Chat from "./Pages/Chat";
import Matches from "./Pages/Matches";
import UserDetail from "./Pages/UserDetail";
import PhotoManager from "./Pages/PhotoManager";
import FilterPage from "./Pages/FilterPage";


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
      <Stack.Navigator initialRouteName='Home' screenOptions={{headerShown:false, gestureEnabled: false}}>
        <Stack.Screen name='Home' component={Homescreen}/> 
        <Stack.Screen name='CreateUser' component={CreateUser}/>
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='CreateListing' component={CreateListing}/>
        <Stack.Screen name='UserImagePicker' component={UserImagePicker}/>
        <Stack.Screen name='DetailedAboutYou' component={DetailedAboutYou}/>
        <Stack.Screen name='MyProfile' component={MyProfile}/>
        <Stack.Screen name='MyListing' component={MyListing}/>
        <Stack.Screen name='EditListing' component={EditListing}/>
        <Stack.Screen name='DetailedListing' component={DetailedListing}/>
        <Stack.Screen name='EditProfile' component={EditProfile}/>
        <Stack.Screen name='Swipe' component={Swipe}/>
        <Stack.Screen name='AllListings' component={AllListings}/>
        <Stack.Screen name='Matches' component={Matches}/>
        <Stack.Screen name='Chat' component={Chat}/>
        <Stack.Screen name='UserDetail' component={UserDetail}/>
        <Stack.Screen name='PhotoManager' component={PhotoManager}/>
        <Stack.Screen name='FilterPage' component={FilterPage}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
