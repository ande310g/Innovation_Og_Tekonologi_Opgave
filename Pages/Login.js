import React, { useState } from 'react';
import {View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Image} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from "./Styles";

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const userRef = ref(database, 'users/' + user.uid);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    console.log('User data:', snapshot.val());
                    navigation.navigate('MyProfile');
                } else {
                    navigation.navigate('Home');
                }
        }).catch((error) => {
            setError(error.message);
        })
    }
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#ffffff"}}>
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={globalStyles.container}>
                    <View style={globalStyles.backAndLogoContainer}>

                        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={globalStyles.backButton}> ← Tilbage</Text>
                        </TouchableOpacity>
                        <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                    </View>
                    <Text style={globalStyles.label}>Mailadresse</Text>
                    <TextInput style={globalStyles.input}
                        placeholder="Mailadresse"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Text style={globalStyles.label}>Adgangskode</Text>
                    <TextInput style={globalStyles.input}
                               placeholder="Adgangskode"
                               value={password}
                               onChangeText={setPassword}
                               secureTextEntry={true}/>
                    <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
                        <Text style={globalStyles.buttonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

        </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
export default Login;