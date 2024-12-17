import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Switch, Image, KeyboardAvoidingView, ScrollView, Platform, SafeAreaView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { set, ref } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// Komponent til oprettelse af ny bruger
const CreateUser = ({ navigation }) => {
    // State til brugerens data og formularfelter
    const [email, setEmail] = useState(''); // Mailadresse
    const [password, setPassword] = useState(''); // Adgangskode
    const [error, setError] = useState(''); // Fejlbeskeder
    const [name, setName] = useState(''); // Navn
    const [phoneNumber, setPhoneNumber] = useState(''); // Telefonnummer
    const [aboutMe, setAboutMe] = useState(''); // Kort beskrivelse om brugeren
    const [hasPlace, setHasPlace] = useState(false); // Switch til at angive "Har et sted" eller ej
    const [dob, setDob] = useState(new Date()); // Fødselsdato
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // State til dato-vælger

    // Funktion til at håndtere oprettelse af bruger
    const handleSignUp = () => {
        // Tjekker om alle felter er udfyldt
        if (!name || !email || !password || !phoneNumber || !aboutMe) {
            setError('Alle felter skal udfyldes!');
            return;
        }

        // Opretter ny bruger med Firebase Authentication
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user; // Henter den oprettede bruger
                if (user) {
                    try {
                        // Gemmer brugerens data i Firebase Realtime Database
                        set(ref(database, 'users/' + user.uid), {
                            name, // Brugerens navn
                            dob: dob.toISOString(), // Fødselsdato som ISO-string
                            hasPlace, // Switch-værdi (Har et sted eller ej)
                            aboutMe, // Beskrivelse om brugeren
                            phoneNumber, // Telefonnummer
                        }).then(() => {
                            console.log('Brugerdata gemt i databasen');
                            navigation.navigate('UserImagePicker'); // Navigerer til næste side
                        }).catch((dbError) => {
                            setError(dbError.message); // Viser fejlbesked fra databasen
                        });
                    } catch (err) {
                        setError(err.message); // Viser generel fejlbesked
                    }
                }
            })
            .catch((authError) => {
                setError(authError.message); // Viser fejl fra Firebase Authentication
            });
    };

    // Funktion til at vise dato-vælger
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    // Funktion til at skjule dato-vælger
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    // Håndterer valg af fødselsdato
    const handleConfirm = (date) => {
        if (date) {
            setDob(date); // Opdaterer state med valgt dato
            hideDatePicker();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={globalStyles.container}>
                        {/* Tilbage-knap og logo */}
                        <View style={globalStyles.backAndLogoContainer}>
                            <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                                <Text style={globalStyles.backButton}> ← Tilbage</Text>
                            </TouchableOpacity>
                            <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                        </View>

                        {/* Titel */}
                        <Text style={globalStyles.title}>Opret bruger</Text>

                        {/* Inputfelter */}
                        <Text style={globalStyles.label}>Navn</Text>
                        <TextInput
                            placeholder="Fornavn og efternavn"
                            value={name}
                            onChangeText={setName}
                            style={globalStyles.input}
                        />

                        <Text style={globalStyles.label}>Fødselsdato</Text>
                        <TouchableOpacity onPress={showDatePicker} style={globalStyles.input}>
                            <Text style={globalStyles.date}>{dob.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {/* Dato-vælger */}
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                            display="spinner"
                            textColor="black"
                            minimumDate={new Date(1900, 0, 1)} // Minimumdato for fødselsdato
                            maximumDate={new Date()} // Maksimumdato er dags dato
                        />

                        <Text style={globalStyles.label}>Kort om dig</Text>
                        <TextInput
                            placeholder="Fortæl os lidt om dig selv!"
                            value={aboutMe}
                            onChangeText={setAboutMe}
                            style={globalStyles.inputBio}
                            multiline // Tillader flere linjer
                        />

                        <Text style={globalStyles.label}>Mailadresse</Text>
                        <TextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            style={globalStyles.input}
                            keyboardType="email-address"
                            autoCapitalize="none" // Forhindrer store bogstaver
                        />

                        <Text style={globalStyles.label}>Adgangskode</Text>
                        <TextInput
                            placeholder="Adgangskode"
                            value={password}
                            onChangeText={setPassword}
                            style={globalStyles.input}
                            secureTextEntry // Skjuler input
                        />

                        <Text style={globalStyles.label}>Telefonnummer</Text>
                        <TextInput
                            placeholder="Telefonnummer"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            style={globalStyles.input}
                            keyboardType="phone-pad" // Numerisk tastatur til telefonnumre
                        />

                        {/* Switch til "Har et værelse" */}
                        <View style={globalStyles.Container}>
                            <Text style={globalStyles.switchLabel}>
                                Har du et værelse og leder efter en bofælle, eller leder du efter et sted at bo?
                            </Text>
                            <View style={globalStyles.switchRow}>
                                <Text style={globalStyles.switchText}>
                                    {hasPlace ? 'Har et værelse' : 'Leder efter et sted at bo'}
                                </Text>
                                <Switch
                                    value={hasPlace}
                                    onValueChange={setHasPlace}
                                    trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                                    thumbColor={hasPlace ? '#007bff' : '#f4f3f4'}
                                    style={globalStyles.switch}
                                />
                            </View>
                        </View>

                        {/* Fejlbesked */}
                        {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}

                        {/* Tilmeld-knap */}
                        <TouchableOpacity style={globalStyles.button} onPress={handleSignUp}>
                            <Text style={globalStyles.buttonText}>Tilmeld dig</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default CreateUser;
