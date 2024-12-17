import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Switch, Image, KeyboardAvoidingView, ScrollView, Platform, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { set, ref, getDatabase } from 'firebase/database';
import { globalStyles } from './Styles';

// Komponent til at indsamle detaljerede brugeroplysninger
const DetailedAboutYou = ({ navigation }) => {
    // State til formularens forskellige inputfelter og switch-værdier
    const [smoker, setSmoker] = useState(false); // Boolean: Angiver om brugeren ryger
    const [hasPets, setHasPets] = useState(false); // Boolean: Angiver om brugeren har kæledyr
    const [profession, setProfession] = useState(''); // Brugerens erhverv
    const [hobbies, setHobbies] = useState(''); // Brugerens hobbyer
    const [noiseTolerance, setNoiseTolerance] = useState(''); // Brugerens støjniveau-tolerance
    const [aboutLifestyle, setAboutLifestyle] = useState(''); // Beskrivelse af brugerens livsstil
    const [error, setError] = useState(''); // State til at håndtere fejlbeskeder

    // Funktion til at gemme brugerens detaljer i Firebase Realtime Database
    const handleSaveDetails = () => {
        const auth = getAuth(); // Henter den nuværende bruger
        const user = auth.currentUser;

        // Validering: Tjekker at alle felter er udfyldt
        if (!profession || !hobbies || !noiseTolerance || !aboutLifestyle) {
            setError('Alle felter skal udfyldes!');
            return;
        }

        // Hvis brugeren er logget ind, gemmes data i Firebase
        if (user) {
            const db = getDatabase(); // Initialiserer databasen
            set(ref(db, `users/${user.uid}/details`), {
                smoker, // Gemmer ryge-status
                hasPets, // Gemmer kæledyr-status
                profession, // Gemmer brugerens erhverv
                hobbies, // Gemmer hobbyer
                noiseTolerance, // Gemmer støjtolerance
                aboutLifestyle, // Gemmer livsstilsbeskrivelsen
            })
                .then(() => {
                    console.log('Detaljer gemt succesfuldt!');
                    navigation.navigate('MyProfile'); // Navigerer til profilsiden
                })
                .catch((err) => {
                    setError(err.message); // Viser en fejlbesked, hvis der opstår fejl
                });
        } else {
            setError('Bruger ikke logget ind!'); // Fejl hvis ingen bruger er logget ind
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
                                <Text style={globalStyles.backButton}>← Tilbage</Text>
                            </TouchableOpacity>
                            <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                        </View>

                        {/* Titel */}
                        <Text style={globalStyles.title}>Fortæl os lidt om dig selv</Text>

                        {/* Input til erhverv */}
                        <Text style={globalStyles.label}>Erhverv</Text>
                        <TextInput
                            placeholder="E.g., Softwareudvikler, Studerende"
                            value={profession}
                            onChangeText={setProfession}
                            style={globalStyles.input}
                        />

                        {/* Input til hobbyer */}
                        <Text style={globalStyles.label}>Hobbyer</Text>
                        <TextInput
                            placeholder="E.g., Madlavning, Løb, Gaming"
                            value={hobbies}
                            onChangeText={setHobbies}
                            style={globalStyles.inputBio}
                            multiline // Tillader flere linjer
                        />

                        {/* Picker til støjniveau */}
                        <Text style={globalStyles.label}>Støjniveau</Text>
                        <View style={[globalStyles.pickerContainer]}>
                            <Picker
                                selectedValue={noiseTolerance} // Værdi valgt i dropdown
                                onValueChange={(itemValue) => setNoiseTolerance(itemValue)}
                                mode="dropdown" // Dropdown til valg
                                dropdownIconColor="black"
                            >
                                <Picker.Item label="Vælg niveau" value="" />
                                <Picker.Item label="Lavt" value="Lavt" />
                                <Picker.Item label="Mellem" value="Mellem" />
                                <Picker.Item label="Højt" value="Højt" />
                            </Picker>
                        </View>

                        {/* Input til livsstilsbeskrivelse */}
                        <Text style={globalStyles.label}>Livsstil</Text>
                        <TextInput
                            placeholder="Beskriv din livsstil, rutiner, vaner, etc."
                            value={aboutLifestyle}
                            onChangeText={setAboutLifestyle}
                            style={globalStyles.inputBio}
                            multiline
                        />

                        {/* Switch: Ryger-status */}
                        <View style={globalStyles.switchContainer}>
                            <Text style={globalStyles.switchLabel}>Ryger du?</Text>
                            <Switch
                                value={smoker}
                                onValueChange={setSmoker}
                                trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                                thumbColor={smoker ? '#007bff' : '#f4f3f4'}
                            />
                        </View>

                        {/* Switch: Kæledyr-status */}
                        <View style={globalStyles.switchContainer}>
                            <Text style={globalStyles.switchLabel}>Har du kæledyr?</Text>
                            <Switch
                                value={hasPets}
                                onValueChange={setHasPets}
                                trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                                thumbColor={hasPets ? '#007bff' : '#f4f3f4'}
                            />
                        </View>

                        {/* Fejlbesked */}
                        {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}

                        {/* Gem-knap */}
                        <TouchableOpacity style={globalStyles.button} onPress={handleSaveDetails}>
                            <Text style={globalStyles.buttonText}>Gem</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default DetailedAboutYou;
