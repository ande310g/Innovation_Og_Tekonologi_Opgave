import React from 'react';
import { View, Text, TouchableOpacity, Image} from 'react-native';
import { globalStyles } from './Styles';

const Homescreen = ({ navigation }) => {
  return (
    <View style={globalStyles.container}>
      <Image source={require('../assets/Logo.png')} style={{width: 500, height: 150, alignSelf: 'center', marginBottom: 0, marginLeft: 30}} />
      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('CreateUser')}>
        <Text style={globalStyles.buttonText}>Opret bruger</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={globalStyles.buttonText}>Log ind</Text>r
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('CreateListing')}>
        <Text style={globalStyles.buttonText}>Opret lejemål</Text>
      </TouchableOpacity>
    </View>
  );

}

export default Homescreen;

