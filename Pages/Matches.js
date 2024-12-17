import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, SafeAreaView } from 'react-native';
import { ref, onValue, get } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';

const Matches = ({ navigation }) => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchMatches = async () => {
            const matchesRef = ref(database, `matches/${auth.currentUser.uid}`);
            onValue(matchesRef, async (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const matchEntries = Object.keys(data).map((matchId) => ({
                        id: matchId,
                        ...data[matchId],
                    }));

                    // Fetch profile pictures and DOB for matches
                    const enrichedMatches = await Promise.all(
                        matchEntries.map(async (match) => {
                            const userRef = ref(database, `users/${match.id}`);
                            const userSnapshot = await get(userRef);

                            let profilePicture = null;
                            let age = null;

                            if (userSnapshot.exists()) {
                                const userData = userSnapshot.val();
                                profilePicture = userData?.userPicks?.images?.[0] || null; // Get the first image if exists

                                // Calculate age from DOB
                                if (userData.dob) {
                                    const dob = new Date(userData.dob);
                                    const today = new Date();
                                    age = today.getFullYear() - dob.getFullYear();
                                    if (
                                        today.getMonth() < dob.getMonth() ||
                                        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
                                    ) {
                                        age -= 1; // Adjust if the birthday hasn't occurred yet this year
                                    }
                                }
                            }

                            return { ...match, profilePicture, age };
                        })
                    );

                    setMatches(enrichedMatches);
                } else {
                    setMatches([]);
                }
            });
        };

        fetchMatches();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={[globalStyles.container, styles.profileContainer]}>
                <View style={globalStyles.backAndLogoContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
                        <Text style={globalStyles.backButton}>← Tilbage</Text>
                    </TouchableOpacity>
                    <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                </View>
                <View style={globalStyles.container}>
                    <Text style={globalStyles.title}>Your Matches</Text>
                    {matches.length === 0 ? (
                        <Text style={globalStyles.noMatchesText}>No matches found</Text>
                    ) : (
                        <FlatList
                            data={matches}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={globalStyles.listItem}
                                    onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
                                >
                                    <View style={styles.matchItem}>
                                        {/* Profile Picture */}
                                        {item.profilePicture ? (
                                            <Image
                                                source={{ uri: item.profilePicture }}
                                                style={styles.profileImage}
                                            />
                                        ) : (
                                            <Image
                                                source={require('../assets/Pfp.png')}
                                                style={styles.profileImage}
                                            />
                                        )}

                                        {/* Match Details */}
                                        <View style={styles.matchDetails}>
                                            <Text style={globalStyles.listTitle}>
                                                {item.name}, {item.age ? `${item.age} ` : "Alder ikke angivet"}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.zoomButton}
                                                onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
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

const styles = StyleSheet.create({
    profileContainer: {
        flex: 1,
    },
    matchItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 10,
    },
    matchDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    zoomButton: {
        marginTop: 5,
    },
});

export default Matches;