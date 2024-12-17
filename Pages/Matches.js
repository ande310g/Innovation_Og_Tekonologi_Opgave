import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, SafeAreaView } from 'react-native';
import { ref, onValue, get } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';

// Komponent til at vise brugerens matches
const Matches = ({ navigation }) => {
    const [matches, setMatches] = useState([]); // State til at holde en liste over matches

    // Henter brugerens matches ved første rendering
    useEffect(() => {
        const fetchMatches = async () => {
            const matchesRef = ref(database, `matches/${auth.currentUser.uid}`); // Reference til brugerens matches i databasen

            onValue(matchesRef, async (snapshot) => {
                const data = snapshot.val(); // Henter data fra matches-stien
                if (data) {
                    // Konverterer matches til et array
                    const matchEntries = Object.keys(data).map((matchId) => ({
                        id: matchId,
                        ...data[matchId],
                    }));

                    // Henter profilbilleder for hver match
                    const enrichedMatches = await Promise.all(
                        matchEntries.map(async (match) => {
                            const userRef = ref(database, `users/${match.id}/userPicks/images`); // Sti til brugerens billeder
                            const imageSnapshot = await get(userRef);

                            // Hvis der findes billeder, tager vi det første billede
                            const profilePicture = imageSnapshot.exists()
                                ? imageSnapshot.val()[0]
                                : null;

                            return { ...match, profilePicture }; // Tilføjer billedlink til match-objektet
                        })
                    );

                    setMatches(enrichedMatches); // Opdaterer matches med billeder
                } else {
                    setMatches([]); // Hvis der ingen matches er, sætter vi en tom liste
                }
            });
        };

        fetchMatches();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={[globalStyles.container, styles.profileContainer]}>
                {/* Header med tilbage-knap og logo */}
                <View style={globalStyles.backAndLogoContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
                        <Text style={globalStyles.backButton}>← Tilbage</Text>
                    </TouchableOpacity>
                    <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                </View>

                {/* Titel */}
                <View style={globalStyles.container}>
                    <Text style={globalStyles.title}>Dine Matches</Text>

                    {/* Viser en besked, hvis der ikke findes nogen matches */}
                    {matches.length === 0 ? (
                        <Text style={globalStyles.noMatchesText}>Ingen matches fundet</Text>
                    ) : (
                        // FlatList til at vise listen over matches
                        <FlatList
                            data={matches}
                            keyExtractor={(item) => item.id} // Giver hvert element en unik nøgle
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={globalStyles.listItem}
                                    onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
                                >
                                    <View style={styles.matchItem}>
                                        {/* Viser profilbillede */}
                                        {item.profilePicture ? (
                                            <Image
                                                source={{ uri: item.profilePicture }} // Viser første billede fra brugerens liste
                                                style={styles.profileImage}
                                            />
                                        ) : (
                                            <Image
                                                source={require('../assets/Pfp.png')} // Standardbillede, hvis intet billede findes
                                                style={styles.profileImage}
                                            />
                                        )}

                                        {/* Match detaljer */}
                                        <View style={styles.matchDetails}>
                                            <Text style={globalStyles.listTitle}>{item.name}</Text>
                                            {/* Brugerens navn */}
                                            <TouchableOpacity
                                                style={styles.zoomButton}
                                                onPress={() => navigation.navigate('UserDetail', { userId: item.id })} // Navigerer til detaljeret visning
                                            >
                                                <Text style={globalStyles.zoomButtonText}>Zoom</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

// Lokale stilarter til `Matches` komponenten
const styles = StyleSheet.create({
    profileContainer: {
        flex: 1,
    },
    matchItem: {
        flexDirection: 'row', // Placerer profilbillede og detaljer i en række
        alignItems: 'center', // Centrerer elementerne lodret
    },
    profileImage: {
        width: 60, // Billedets bredde
        height: 60, // Billedets højde
        borderRadius: 30, // Gør billedet rundt
        marginRight: 10, // Afstand mellem billede og tekst
    },
    matchDetails: {
        flex: 1, // Tillader teksten at fylde resten af pladsen
        justifyContent: 'center',
    },
    zoomButton: {
        marginTop: 5, // Afstand over knappen
    },
});

export default Matches;
