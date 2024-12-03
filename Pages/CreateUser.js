import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Switch } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Component/firebase';
import DismissKeyboardWrapper from '../Component/DismissKeyboardWrapper';
import { globalStyles } from './Styles';

const CreateUser = ({navigation}) => {
    const [email, setEmail] = useState(''); // State til at gemme email-input
    const [password, setPassword] = useState(''); // State til at gemme password-input
    const [error, setError] = useState(''); // State til at gemme fejlbeskedconst
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [aboutMe, setAboutMe] = useState('')
    const [hasPlace, setHasPlace] = useState(false)
    const [age, setAge] = useState('')
    



    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                if (user) {
                    try{
                        set(ref(database, 'users/' + user.uid), {
                            name,
                            age,
                            hasPlace,
                            aboutMe,
                            phoneNumber
                        });
                    }
                    catch {
                        setError(error.message);
                    }
                }
                console.log('User registered: ', user); // Logger oplysninger om registreret bruger
                navigation.navigate('Info'); // Navigerer til 'Info' efter vellykket tilmelding
            })
            .catch((error) => {
                setError(error.message); // Sætter fejlbesked, hvis tilmelding mislykkes
            });
    };

    return (
        <DismissKeyboardWrapper>
        <View style={globalStyles.container}>
            <TextInput
                placeholder="Navn"
                value={name} // Input til navn
                onChangeText={setName} // Opdaterer navn state
                style={globalStyles.input}
            />
            <TextInput
                placeholder="Alder"
                value={age} // Input til alder
                onChangeText={setAge} // Opdaterer alder state
                keyboardType="number-pad"
                style={globalStyles.input}
            />

                {/* Switch for boligstatus */}
            <View style={globalStyles.switchContainer}>
                <Text style={globalStyles.switchLabel}>Leder du et værelse og leder efter en bofælle eller leder du efter et sted at bo?</Text>
                <View style={globalStyles.switchRow}>
                    <Text style={globalStyles.switchText}>{hasPlace ? 'Har et værelse' : 'Leder efter et sted at bo'}</Text>
                    <Switch
                        value={hasPlace}
                        onValueChange={setHasPlace}
                        trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                        thumbColor={hasPlace ? '#007bff' : '#f4f3f4'}
                        style={globalStyles.switch}
                    />
                </View>
            </View>

            <TextInput
                placeholder="Fortæl os omkring dig selv"
                value={aboutMe} // Input til bio
                onChangeText={setAboutMe} // Opdaterer bio state
                style={globalStyles.input}
                multiline
            />
            <TextInput
                placeholder="Email"
                value={email} // Email input fra brugeren
                onChangeText={setEmail} // Opdaterer email state
                style={globalStyles.input}
                keyboardType="email-address" // Angiver tastaturtypen som e-mail
                autoCapitalize="none" // Undgår automatisk store bogstaver
            />
            <TextInput
                placeholder="Adgangskode"
                value={password} // Password input fra brugeren
                onChangeText={setPassword} // Opdaterer password state
                style={globalStyles.input}
                secureTextEntry // Skjuler password-input
            />
            {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={globalStyles.button} onPress={handleSignUp}>
                <Text style={globalStyles.buttonText}>Tilmeld dig</Text>
            </TouchableOpacity>
        </View>
    </DismissKeyboardWrapper>
    )

}

export default CreateUser