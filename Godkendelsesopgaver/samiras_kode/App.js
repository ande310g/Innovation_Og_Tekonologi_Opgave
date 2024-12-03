import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import CreateListing from './screens/createlisting';
import Listings from './screens/listings';
import Home from './screens/home';
import Details from './screens/listingdetails';
import Edit from './screens/editlisting';
import './firebaseconfig'; 


//Navigation
const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown:false}}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="CreateListing" component={CreateListing} />
        <Stack.Screen name="Listings" component={Listings} />
        <Stack.Screen name="ListingDetails" component={Details} />
        <Stack.Screen name="EditListing" component={Edit} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
