import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    SafeAreaView,
    Image,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importerer Firebase sign-in funktion
import { ref, get } from 'firebase/database'; // Henter data fra Firebase Realtime Database
import { auth, database } from '../Component/firebase';
import { globalStyles } from "./Styles";

// Komponent til login-funktionalitet
const Login = ({ navigation }) => {
    // State til at holde brugerinput og fejlmeddelelser
    const [email, setEmail] = useState(''); // Brugerens email
    const [password, setPassword] = useState(''); // Brugerens adgangskode
    const [error, setError] = useState(''); // Eventuelle fejlmeddelelser

    // Funktion til at håndtere login
    const handleLogin = () => {
        // Bruger Firebase Authentication til at logge brugeren ind
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user; // Henter brugerens oplysninger
                const userRef = ref(database, 'users/' + user.uid); // Reference til brugerens data i databasen
                const snapshot = await get(userRef); // Henter data fra databasen

                if (snapshot.exists()) {
                    console.log('Brugerdata:', snapshot.val());
                    navigation.navigate('MyProfile'); // Navigerer til brugerens profilside
                } else {
                    navigation.navigate('Home'); // Navigerer til hjemmeskærmen, hvis data mangler
                }
            })
            .catch((error) => {
                setError(error.message); // Viser fejlbesked ved forkert login
            });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            {/* Gør inputområdet tilgængeligt ved tastaturbrug */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

                {/* ScrollView giver plads til at scrolle på mindre skærme */}
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={globalStyles.container}>
                        {/* Header med tilbage-knap og logo */}
                        <View style={globalStyles.backAndLogoContainer}>
                            <TouchableOpacity
                                style={globalStyles.backButton}
                                onPress={() => navigation.goBack()}>
                                <Text style={globalStyles.backButton}> ← Tilbage</Text>
                            </TouchableOpacity>
                            <Image
                                source={require('../assets/Logo.jpg')} // Viser logoet
                                style={{ width: 110, height: 60 }}
                            />
                        </View>

                        {/* Inputfelt til mailadresse */}
                        <Text style={globalStyles.label}>Mailadresse</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Mailadresse"
                            value={email} // Binder inputfeltet til email-state
                            onChangeText={setEmail} // Opdaterer state ved ændringer
                        />

                        {/* Inputfelt til adgangskode */}
                        <Text style={globalStyles.label}>Adgangskode</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Adgangskode"
                            value={password} // Binder inputfeltet til password-state
                            onChangeText={setPassword} // Opdaterer state ved ændringer
                            secureTextEntry={true} // Skjuler input for adgangskode
                        />

                        {/* Login-knap */}
                        <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
                            <Text style={globalStyles.buttonText}>Login</Text>
                        </TouchableOpacity>

                        {/* Fejlmeddelelse vises, hvis login mislykkes */}
                        {error ? (
                            <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Login;
