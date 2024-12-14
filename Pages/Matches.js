import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, SafeAreaView } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';

const Matches = ({ navigation }) => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const matchesRef = ref(database, `matches/${auth.currentUser.uid}`);
        const unsubscribe = onValue(matchesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const matchList = Object.keys(data).map((matchId) => ({
                    id: matchId,
                    ...data[matchId],
                }));
                setMatches(matchList);
            } else {
                setMatches([]);
            }
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    const handleChatOpen = (match) => {
        navigation.navigate('Chat', { matchId: match.id, matchName: match.name });
    };

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
                        <Text style={styles.noMatchesText}>No matches found</Text>
                    ) : (
                        <FlatList
                            data={matches}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.listItem}
                                    onPress={() => handleChatOpen(item)}
                                >
                                    <Text style={styles.listTitle}>{item.name}</Text>
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
    listItem: globalStyles.listItem,
    listTitle: globalStyles.listTitle,
    noMatchesText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
        fontSize: 16,
    },
});

export default Matches;
