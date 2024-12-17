import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { globalStyles } from './Styles';

// Hovedskærm, som giver brugeren mulighed for at oprette en ny bruger eller logge ind
const Homescreen = ({ navigation }) => {
    return (
        <View style={globalStyles.container}>
            {/* Logo vises øverst på skærmen */}
            <Image
                source={require('../assets/Logo.png')} // Indlæser logo fra assets-mappen
                style={{
                    width: 500, // Billedets bredde
                    height: 150, // Billedets højde
                    alignSelf: 'center', // Centrerer billedet horisontalt
                    marginBottom: 0, // Ingen margen i bunden
                    marginLeft: 30, // Flytter billedet lidt til højre
                }}
            />

            {/* Knap til at navigere til oprettelse af en ny bruger */}
            <TouchableOpacity
                style={globalStyles.button} // Anvender global stil til knapper
                onPress={() => navigation.navigate('CreateUser')} // Navigerer til "CreateUser"-skærmen
            >
                <Text style={globalStyles.buttonText}>Opret bruger</Text>
                {/* Knaptekst */}
            </TouchableOpacity>

            {/* Knap til at navigere til login-skærmen */}
            <TouchableOpacity
                style={globalStyles.button} // Genbruger global stil til knapper
                onPress={() => navigation.navigate('Login')} // Navigerer til "Login"-skærmen
            >
                <Text style={globalStyles.buttonText}>Log ind</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Homescreen;
