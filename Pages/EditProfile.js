import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, ScrollView, Image, SafeAreaView } from 'react-native';
import { ref, update, onValue } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';

// Komponent til at redigere brugerens profiloplysninger
const EditProfile = ({ navigation }) => {
    // State til at gemme brugerens profiloplysninger
    const [name, setName] = useState(''); // Brugerens navn
    const [aboutMe, setAboutMe] = useState(''); // Kort beskrivelse om brugeren
    const [phoneNumber, setPhoneNumber] = useState(''); // Brugerens telefonnummer
    const [hobbies, setHobbies] = useState(''); // Brugerens hobbyer
    const [profession, setProfession] = useState(''); // Brugerens erhverv

    // Henter brugerens eksisterende profiloplysninger fra Firebase ved første rendering
    useEffect(() => {
        const userRef = ref(database, `users/${auth.currentUser.uid}`); // Reference til brugerens data i Firebase
        onValue(userRef, (snapshot) => {
            const data = snapshot.val(); // Henter data fra snapshot
            if (data) {
                setName(data.name || ''); // Sætter brugerens navn
                setAboutMe(data.aboutMe || ''); // Sætter "Om Mig" beskrivelse
                setPhoneNumber(data.phoneNumber || ''); // Sætter telefonnummer
                setHobbies(data.details?.hobbies || ''); // Sætter hobbyer, hvis de findes
                setProfession(data.details?.profession || ''); // Sætter profession, hvis den findes
            }
        });
    }, []);

    // Funktion til at gemme opdaterede oplysninger i Firebase Realtime Database
    const handleSave = () => {
        const userRef = ref(database, `users/${auth.currentUser.uid}`); // Reference til brugerens data
        update(userRef, { // Opdaterer Firebase med de nye data
            name, // Opdateret navn
            aboutMe, // Opdateret "Om Mig" beskrivelse
            phoneNumber, // Opdateret telefonnummer
            details: { // Opdaterede detaljer (hobbyer og profession)
                hobbies,
                profession,
            },
        })
            .then(() => {
                Alert.alert('Success', 'Profil opdateret!'); // Succes-besked
                navigation.goBack(); // Går tilbage til forrige skærm
            })
            .catch((error) => {
                Alert.alert('Fejl', error.message); // Viser fejlbesked ved fejl
            });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            {/* ScrollView gør, at indholdet kan scrolle, hvis det er for stort til skærmen */}
            <ScrollView contentContainerStyle={globalStyles.container}>
                {/* Header med tilbage-knap og logo */}
                <View style={globalStyles.backAndLogoContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
                        <Text style={globalStyles.backButton}>← Tilbage</Text>
                    </TouchableOpacity>
                    <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                </View>

                {/* Input til navn */}
                <Text style={globalStyles.label}>Navn</Text>
                <TextInput
                    style={globalStyles.input}
                    value={name} // Binder inputværdien til state
                    onChangeText={setName} // Opdaterer state ved ændring
                />

                {/* Input til "Om Mig" */}
                <Text style={globalStyles.label}>Om Mig</Text>
                <TextInput
                    style={globalStyles.inputBio}
                    value={aboutMe}
                    onChangeText={setAboutMe}
                    multiline // Tillader flere linjer
                />

                {/* Input til telefonnummer */}
                <Text style={globalStyles.label}>Telefonnummer</Text>
                <TextInput
                    style={globalStyles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad" // Viser numerisk tastatur
                />

                {/* Input til hobbyer */}
                <Text style={globalStyles.label}>Hobbyer</Text>
                <TextInput
                    style={globalStyles.input}
                    value={hobbies}
                    onChangeText={setHobbies}
                />

                {/* Input til profession */}
                <Text style={globalStyles.label}>Profession</Text>
                <TextInput
                    style={globalStyles.input}
                    value={profession}
                    onChangeText={setProfession}
                />

                {/* Knappen til at gemme ændringer */}
                <TouchableOpacity style={globalStyles.button} onPress={handleSave}>
                    <Text style={globalStyles.buttonText}>Gem</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfile;
