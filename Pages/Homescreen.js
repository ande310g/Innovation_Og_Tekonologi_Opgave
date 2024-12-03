import React from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import { globalStyles } from './Styles';

const Homescreen = ({ navigation }) => {
  return (
    <View style={globalStyles.container}>
      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('CreateUser')}>
        <Text style={globalStyles.buttonText}>Opret bruger</Text>
      </TouchableOpacity>
      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={globalStyles.buttonText}>Log ind</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Homescreen;

