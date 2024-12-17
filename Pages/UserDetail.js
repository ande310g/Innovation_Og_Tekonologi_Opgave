import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    StyleSheet
} from 'react-native';
import { ref, onValue, remove, get } from 'firebase/database';
import { database, auth } from '../Component/firebase';
import { globalStyles } from './Styles';

// Komponent til at vise detaljer om en bruger og deres annoncer
const UserDetail = ({ route, navigation }) => {
    const { userId } = route.params; // Bruger-ID fra navigationens parametre
    const [userDetails, setUserDetails] = useState(null); // State til brugerens detaljer
    const [userListings, setUserListings] = useState([]); // State til brugerens annoncer
    const [loading, setLoading] = useState(true); // State til at indikere indlæsning

    // Henter brugerens detaljer ved første rendering
    useEffect(() => {
        const userRef = ref(database, `users/${userId}`); // Reference til brugerens data i Firebase
        const unsubscribe = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            setUserDetails(data); // Gemmer brugerens detaljer i state
            setLoading(false); // Stopper indlæsningen
        });

        return () => unsubscribe(); // Rydder op ved afmontering
    }, [userId]);

    // Henter brugerens lejemålsannoncer
    useEffect(() => {
        const listingsRef = ref(database, `listings/${userId}`); // Reference til brugerens annoncer
        get(listingsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const listingsArray = Object.entries(data).map(([id, value]) => ({
                        id,
                        ...value, // Konverterer objekt til array af annoncer
                    }));
                    setUserListings(listingsArray);
                } else {
                    setUserListings([]); // Tøm listen, hvis ingen annoncer findes
                }
            })
            .catch((error) => console.error("Fejl ved hentning af annoncer:", error));
    }, [userId]);

    // Funktion til at slette et match
    const handleDeleteMatch = () => {
        const currentUserId = auth.currentUser.uid;

        // Referencer til matches for begge brugere
        const currentUserMatchRef = ref(database, `matches/${currentUserId}/${userId}`);
        const otherUserMatchRef = ref(database, `matches/${userId}/${currentUserId}`);

        Promise.all([
            remove(currentUserMatchRef),
            remove(otherUserMatchRef),
        ])
            .then(() => {
                alert('Match slettet!');
                navigation.goBack(); // Går tilbage til forrige skærm
            })
            .catch((error) => {
                alert('Fejl ved sletning af match: ' + error.message);
            });
    };

    // Funktion til at åbne chat med brugeren
    const handleOpenChat = () => {
        navigation.navigate('Chat', { matchId: userId, matchName: userDetails.name });
    };

    // Viser indlæsningsindikator
    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    // Hvis ingen brugerdata findes
    if (!userDetails) {
        return (
            <View style={globalStyles.noDataContainer}>
                <Text style={globalStyles.errorText}>Ingen brugerdata fundet</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={globalStyles.container}>
                {/* Header med tilbage-knap og logo */}
                <View style={globalStyles.backAndLogoContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
                        <Text style={globalStyles.backButton}>← Tilbage</Text>
                    </TouchableOpacity>
                    <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                </View>

                {/* Brugerens navn og alder */}
                <View style={styles.nameRow}>
                    <Text style={globalStyles.title}>
                        {`${userDetails.name || 'Navn ikke angivet'}, ${
                            userDetails.dob
                                ? `${
                                    new Date().getFullYear() - new Date(userDetails.dob).getFullYear()
                                } år`
                                : 'Alder ikke angivet'
                        }`}
                    </Text>
                    {/* Knap til at slette match */}
                    <TouchableOpacity onPress={handleDeleteMatch} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>Slet Match</Text>
                    </TouchableOpacity>
                </View>

                {/* Beskrivelse om brugeren */}
                <Text style={globalStyles.label}>Om mig</Text>
                <Text style={globalStyles.text}>{userDetails.aboutMe}</Text>

                {/* Brugerens annoncer */}
                <Text style={globalStyles.label}>Annoncer</Text>
                {userListings.length > 0 ? (
                    <FlatList
                        data={userListings}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.listItem}
                                onPress={() =>
                                    navigation.navigate('DetailedListing', {
                                        listingId: item.id, // Passer opslagets ID
                                        userId: userId, // Passer ejerens userId
                                    })
                                }
                                activeOpacity={0.8}
                            >
                                {/* Thumbnail billede */}
                                {item.images && item.images[0] ? (
                                    <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />
                                ) : (
                                    <Image source={require('../assets/house.png')} style={styles.thumbnail} />
                                )}
                                {/* Detaljer om annoncen */}
                                <View style={styles.listDetails}>
                                    <Text style={globalStyles.listTitle}>{item.title}</Text>
                                    <Text style={globalStyles.listDetails}>{`Pris: ${item.price} ,-`}</Text>
                                    <Text style={globalStyles.listDetails}>{`Størrelse: ${item.size} m2`}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <Text style={globalStyles.text}>Ingen annoncer fundet</Text>
                )}

                {/* Brugerens billeder */}
                <Text style={globalStyles.label}>Billeder</Text>
                <FlatList
                    data={userDetails.userPicks?.images || []}
                    keyExtractor={(item, index) => `${item}_${index}`}
                    renderItem={({ item }) => (
                        <View style={globalStyles.imageContainer}>
                            <Image source={{ uri: item }} style={globalStyles.image} />
                        </View>
                    )}
                    horizontal
                />
            </View>

            {/* Knap til at åbne chat */}
            <View style={{ padding: 10 }}>
                <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
                    <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: '#FF4D4D',
        padding: 10,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        marginVertical: 5,
        padding: 10,
        borderRadius: 8,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
    },
    listDetails: {
        flex: 1,
    },
    chatButton: {
        backgroundColor: '#49ACD0',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
    },
    chatButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default UserDetail;
