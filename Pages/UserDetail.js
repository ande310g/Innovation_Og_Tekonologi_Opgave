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

const UserDetail = ({ route, navigation }) => {
    const { userId } = route.params;
    const [userDetails, setUserDetails] = useState(null);
    const [userListings, setUserListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user details
    useEffect(() => {
        const userRef = ref(database, `users/${userId}`);
        const unsubscribe = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            setUserDetails(data);
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup
    }, [userId]);

    // Fetch user's listings
    useEffect(() => {
        const listingsRef = ref(database, `listings/${userId}`);
        get(listingsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const listingsArray = Object.entries(data).map(([id, value]) => ({
                        id,
                        ...value,
                    }));
                    setUserListings(listingsArray);
                } else {
                    setUserListings([]);
                }
            })
            .catch((error) => console.error("Error fetching listings:", error));
    }, [userId]);

    const handleDeleteMatch = () => {
        const currentUserId = auth.currentUser.uid;

        // Remove the match from both users
        const currentUserMatchRef = ref(database, `matches/${currentUserId}/${userId}`);
        const otherUserMatchRef = ref(database, `matches/${userId}/${currentUserId}`);

        Promise.all([
            remove(currentUserMatchRef),
            remove(otherUserMatchRef),
        ])
            .then(() => {
                alert('Match deleted successfully.');
                navigation.goBack();
            })
            .catch((error) => {
                alert('Error deleting match: ' + error.message);
            });
    };

    const handleOpenChat = () => {
        navigation.navigate('Chat', { matchId: userId, matchName: userDetails.name });
    };

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (!userDetails) {
        return (
            <View style={globalStyles.noDataContainer}>
                <Text style={globalStyles.errorText}>No user data found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={globalStyles.container}>
                {/* Header */}
                <View style={globalStyles.backAndLogoContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
                        <Text style={globalStyles.backButton}>← Tilbage</Text>
                    </TouchableOpacity>
                    <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                </View>

                {/* Name and Delete Match Button */}
                <View style={styles.nameRow}>
                <Text style={globalStyles.title}>
                    {`${userDetails.name || 'Navn ikke angivet'}, ${
                        userDetails.dob
                            ? `${
                                new Date().getFullYear() - new Date(userDetails.dob).getFullYear() -
                                (new Date().getMonth() < new Date(userDetails.dob).getMonth() ||
                                (new Date().getMonth() === new Date(userDetails.dob).getMonth() &&
                                new Date().getDate() < new Date(userDetails.dob).getDate()) ? 1 : 0)
                            } `
                            : 'Alder ikke angivet'
                    }`}
                </Text>
                <TouchableOpacity onPress={handleDeleteMatch} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>Delete Match</Text>
                </TouchableOpacity>
            </View>

                <Text style={globalStyles.label}>About Me</Text>
                <Text style={globalStyles.text}>{userDetails.aboutMe}</Text>

                {/* Listings Section */}
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
                                    listingId: item.id, // Pass the listing ID
                                    userId: userId, // Pass the owner's userId
                                })
                            }
                            activeOpacity={0.8}
                        >
                            {/* Thumbnail */}
                            {item.images && item.images[0] ? (
                                <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />
                            ) : (
                                <Image source={require('../assets/house.png')} style={styles.thumbnail} />
                            )}
                            {/* Listing Details */}
                            <View style={styles.listDetails}>
                                <Text style={globalStyles.listTitle}>{item.title}</Text>
                                <Text style={globalStyles.listDetails}>{`Price: ${item.price} ,-`}</Text>
                                <Text style={globalStyles.listDetails}>{`Size: ${item.size} m2`}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    style={styles.listingsFlatList} // Added max height
                />
                ) : (
                    <Text style={globalStyles.text}>Ingen annoncer fundet</Text>
                )}

                {/* Gallery Section */}
                <Text style={globalStyles.label}>Gallery</Text>
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

            {/* Open Chat Button */}
            <View style={{ padding: 10 }}>
                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={handleOpenChat}
                >
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
    listingsFlatList: {
        maxHeight: 200, // Restrict FlatList height
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