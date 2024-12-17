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

                    // Fetch profile pictures for matches
                    const enrichedMatches = await Promise.all(
                        matchEntries.map(async (match) => {
                            const userRef = ref(database, `users/${match.id}/userPicks/images`);
                            const imageSnapshot = await get(userRef);

                            const profilePicture = imageSnapshot.exists()
                                ? imageSnapshot.val()[0] // Get the first image if exists
                                : null;

                            return { ...match, profilePicture };
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
                    <Text style={globalStyles.title}>Dine Matches</Text>
                    {matches.length === 0 ? (
                        <Text style={globalStyles.noMatchesText}>Ingen matches fundet</Text>
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
                                            <Text style={globalStyles.listTitle}>{item.name}</Text>
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
        alignItems: 'center', // Align items vertically in the center
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30, // Circular image
        marginRight: 10, // Space between the image and text
    },
    matchDetails: {
        flex: 1, // Allow the text container to take remaining space
        justifyContent: 'center',
    },
    zoomButton: {
        marginTop: 5,
    },
});

export default Matches;