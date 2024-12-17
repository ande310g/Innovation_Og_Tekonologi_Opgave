import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { ref, onValue, set, get } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';

// Komponent til swipe-funktionalitet, der ligner "Tinder"
const Swipe = ({ navigation }) => {
    // State til at holde profiler, den nuværende indeksposition og filtre
    const [profiles, setProfiles] = useState([]); // Alle tilgængelige profiler
    const [currentIndex, setCurrentIndex] = useState(0); // Indeks for den aktuelle profil
    const userId = auth.currentUser.uid; // ID for den nuværende bruger

    useEffect(() => {
        // Funktion til at hente filtre og profiler fra Firebase
        const fetchFiltersAndProfiles = async () => {
            const usersRef = ref(database, 'users'); // Reference til alle brugere
            const listingsRef = ref(database, `listings/${userId}`); // Reference til brugerens opslag
            const swipesRef = ref(database, `swipes/${userId}`); // Reference til tidligere swipes

            try {
                // Henter brugerens opslag (til filtrering)
                const currentListingSnapshot = await get(listingsRef);
                const currentListingDetails = currentListingSnapshot.exists()
                    ? Object.values(currentListingSnapshot.val())[0] // Henter første opslag
                    : null;

                if (!currentListingDetails) {
                    console.error('Ingen opslag fundet for nuværende bruger.');
                    return;
                }

                // Henter alle brugere
                onValue(usersRef, (snapshot) => {
                    const users = snapshot.val() || {};
                    const availableProfiles = Object.keys(users)
                        .filter(uid => uid !== userId && !users[uid].hasPlace) // Ekskluder nuværende bruger og "hasPlace" brugere
                        .map(uid => ({ uid, ...users[uid] }));

                    // Henter tidligere swipes for at ekskludere dem
                    onValue(swipesRef, (swipeSnapshot) => {
                        const swipedUsers = swipeSnapshot.val() || {};

                        const filteredProfiles = availableProfiles
                            .filter(profile => !swipedUsers[profile.uid]) // Filtrer swipede profiler væk
                            .filter(profile => applyFilters(profile, currentListingDetails)); // Filtrering baseret på opslag

                        setProfiles(filteredProfiles); // Sætter de filtrerede profiler i state
                    }, { onlyOnce: true });
                });
            } catch (error) {
                console.error('Fejl ved hentning af profiler eller opslag:', error);
            }
        };

        fetchFiltersAndProfiles();
    }, [userId]);

    // Funktion til at anvende filtre på profiler
    const applyFilters = (profile, currentListingDetails) => {
        const { filters } = profile; // Filtre fra profilen

        if (!filters) return true; // Tillader profiler uden filtre

        // Filtreringslogik
        const { rent, size, areas } = filters;

        const withinRent = rent
            ? currentListingDetails.price >= rent.min && currentListingDetails.price <= rent.max
            : true;

        const withinSize = size
            ? currentListingDetails.size >= size.min && currentListingDetails.size <= size.max
            : true;

        const withinArea = areas?.length
            ? areas.includes(currentListingDetails.city) // Tjekker om byen matcher
            : true;

        return withinRent && withinSize && withinArea;
    };

    // Funktion til at håndtere "Match" (Swipe højre)
    const handleSwipeRight = async () => {
        const swipedUser = profiles[currentIndex];
        if (!swipedUser) return;

        try {
            const currentUserUid = auth.currentUser.uid;

            // Henter nuværende brugers navn fra databasen
            const currentUserRef = ref(database, `users/${currentUserUid}`);
            let currentUserName = '';
            await onValue(currentUserRef, (snapshot) => {
                currentUserName = snapshot.val()?.name || 'Unknown';
            }, { onlyOnce: true });

            // Gemmer swipe som match
            const swipeRef = ref(database, `swipes/${currentUserUid}/${swipedUser.uid}`);
            await set(swipeRef, { matched: true });

            // Gemmer match for begge brugere
            const currentUserMatchesRef = ref(database, `matches/${currentUserUid}/${swipedUser.uid}`);
            const swipedUserMatchesRef = ref(database, `matches/${swipedUser.uid}/${currentUserUid}`);

            await set(currentUserMatchesRef, { name: swipedUser.name });
            await set(swipedUserMatchesRef, { name: currentUserName });

            Alert.alert('Match!', `Du har matchet med ${swipedUser.name}.`);
        } catch (error) {
            console.error('Fejl ved gemning af match:', error);
        }

        setCurrentIndex((prevIndex) => prevIndex + 1); // Går videre til næste profil
    };

    // Funktion til at håndtere "Nej tak" (Swipe venstre)
    const handleSwipeLeft = async () => {
        const swipedUser = profiles[currentIndex];
        if (!swipedUser) return;

        try {
            const swipeRef = ref(database, `swipes/${userId}/${swipedUser.uid}`);
            await set(swipeRef, { matched: false });
        } catch (error) {
            console.error('Fejl ved swipe venstre:', error);
        }

        setCurrentIndex((prevIndex) => prevIndex + 1); // Går videre til næste profil
    };

    // Viser besked, hvis der ikke er flere profiler
    if (currentIndex >= profiles.length) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <Text style={globalStyles.title}>Ingen flere profiler</Text>
            </SafeAreaView>
        );
    }

    // Viser den aktuelle profil
    const currentProfile = profiles[currentIndex];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={globalStyles.container}>
                {/* Header med tilbage-knap */}
                <View style={globalStyles.backAndLogoContainer}>
                    <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={globalStyles.backButton}> ← Tilbage</Text>
                    </TouchableOpacity>
                    <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                </View>

                {/* Profilkort */}
                <View style={globalStyles.profileContainer}>
                    <Image
                        source={
                            currentProfile?.userPicks?.images?.[0]
                                ? { uri: currentProfile.userPicks.images[0] }
                                : require('../assets/Pfp.png') // Standardbillede
                        }
                        style={globalStyles.profileImage}
                    />
                    <Text style={globalStyles.name}>
                        {currentProfile?.name}, {new Date().getFullYear() - new Date(currentProfile?.dob).getFullYear()}
                    </Text>
                    <Text style={globalStyles.about}>{currentProfile?.aboutMe}</Text>

                    {/* Swipe-knapper */}
                    <View style={globalStyles.actions}>
                        <TouchableOpacity onPress={handleSwipeLeft} style={globalStyles.noButton}>
                            <Text style={globalStyles.buttonText}>Nej tak</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSwipeRight} style={globalStyles.yesButton}>
                            <Text style={globalStyles.buttonText}>Match!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Swipe;
