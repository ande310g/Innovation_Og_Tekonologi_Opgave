import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    Image,
    SafeAreaView
} from 'react-native';
import Slider from '@react-native-community/slider'; // Komponent til at vælge værdier inden for et interval
import Checkbox from 'expo-checkbox'; // Komponent til afkrydsningsfelter
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import { globalStyles } from './Styles';

// Komponent til filtrering af boligopslag
const FilterPage = ({ navigation }) => {
    // State til at håndtere filtreringsdata
    const [minRent, setMinRent] = useState(0); // Minimum husleje
    const [maxRent, setMaxRent] = useState(10000); // Maksimum husleje
    const [minSize, setMinSize] = useState(0); // Minimum størrelse
    const [maxSize, setMaxSize] = useState(200); // Maksimum størrelse
    const [selectedAreas, setSelectedAreas] = useState([]); // Valgte områder i København

    // Liste over mulige områder til filtrering
    const copenhagenAreas = [
        'City Center',
        'Nørrebro',
        'Østerbro',
        'Vesterbro',
        'Amager',
        'Frederiksberg',
    ];

    // Henter gemte filtre fra Firebase ved første rendering
    useEffect(() => {
        const fetchFilters = async () => {
            const auth = getAuth(); // Henter nuværende bruger
            const user = auth.currentUser;

            if (user) {
                const db = getDatabase(); // Initialiserer databasen
                const userFiltersRef = ref(db, `users/${user.uid}/filters`); // Reference til brugerens filtre

                try {
                    const snapshot = await get(userFiltersRef);
                    if (snapshot.exists()) {
                        const filters = snapshot.val();
                        setMinRent(filters.rent?.min || 0);
                        setMaxRent(filters.rent?.max || 10000);
                        setMinSize(filters.size?.min || 0);
                        setMaxSize(filters.size?.max || 200);
                        setSelectedAreas(filters.areas || []);
                    }
                } catch (error) {
                    Alert.alert('Fejl', 'Kunne ikke hente gemte filtre.');
                }
            }
        };

        fetchFilters();
    }, []);

    // Funktion til at tilføje eller fjerne et område fra listen over valgte områder
    const toggleArea = (area) => {
        setSelectedAreas((prev) =>
            prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
        );
    };

    // Funktion til at gemme de valgte filtre i Firebase Realtime Database
    const saveFilters = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const db = getDatabase();
            const userFiltersRef = ref(db, `users/${user.uid}/filters`); // Reference til brugerens filtre

            const filters = {
                rent: { min: minRent, max: maxRent }, // Huslejeintervaller
                size: { min: minSize, max: maxSize }, // Størrelsesintervaller
                areas: selectedAreas, // Valgte områder
            };

            try {
                await set(userFiltersRef, filters); // Gemmer filtrene i Firebase
                Alert.alert('Succes', 'Filtrene blev gemt!');
                navigation.goBack(); // Går tilbage til forrige skærm
            } catch (error) {
                Alert.alert('Fejl', 'Kunne ikke gemme filtrene.');
            }
        } else {
            Alert.alert('Fejl', 'Bruger er ikke logget ind.');
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={globalStyles.container}>
                {/* Header med tilbage-knap og logo */}
                <View style={globalStyles.backAndLogoContainer}>
                    <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={globalStyles.backButton}>← Tilbage</Text>
                    </TouchableOpacity>
                    <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                </View>

                {/* Titel */}
                <Text style={globalStyles.title}>Filtrer på bolig</Text>

                {/* Filtrering efter husleje */}
                <Text style={globalStyles.label}>Husleje (DKK/måned)</Text>
                <Text style={globalStyles.text}>{`DKK ${minRent} - ${maxRent}`}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={20000}
                    step={100} // Interval for justering
                    value={minRent}
                    onValueChange={setMinRent}
                />
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={20000}
                    step={100}
                    value={maxRent}
                    onValueChange={setMaxRent}
                />

                {/* Filtrering efter størrelse */}
                <Text style={globalStyles.label}>Størrelse (m²)</Text>
                <Text style={globalStyles.text}>{`${minSize}m² - ${maxSize}m²`}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={300}
                    step={1}
                    value={minSize}
                    onValueChange={setMinSize}
                />
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={300}
                    step={1}
                    value={maxSize}
                    onValueChange={setMaxSize}
                />

                {/* Filtrering efter område */}
                <Text style={globalStyles.label}>Område</Text>
                <FlatList
                    data={copenhagenAreas} // Viser listen over områder
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                value={selectedAreas.includes(item)} // Markerede områder
                                onValueChange={() => toggleArea(item)} // Tilføjer/fjerner område
                                style={{ marginRight: 10 }}
                            />
                            <Text style={globalStyles.text}>{item}</Text>
                        </View>
                    )}
                />

                {/* Knappen til at gemme filtre */}
                <TouchableOpacity style={globalStyles.button} onPress={saveFilters}>
                    <Text style={globalStyles.buttonText}>Gem filtre</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Lokale stilarter til komponenten
const styles = StyleSheet.create({
    slider: {
        width: '100%',
        height: 40,
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
});

export default FilterPage;
