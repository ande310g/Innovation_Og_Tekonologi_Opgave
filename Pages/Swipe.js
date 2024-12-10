import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ref, onValue, set } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';

const Swipe = ({ navigation }) => {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userId, setUserId] = useState(auth.currentUser.uid);

    useEffect(() => {
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
            const users = snapshot.val();
            const availableProfiles = Object.keys(users || {})
                .filter(uid => uid !== userId && !users[uid].hasPlace) // Only users looking for rooms
                .map(uid => ({ uid, ...users[uid] }));
            setProfiles(availableProfiles);
        });
    }, [userId]);

    const handleSwipeRight = async () => {
        const swipedUser = profiles[currentIndex];
        if (!swipedUser) return;

        try {
            // Save swipe in database
            const swipesRef = ref(database, `swipes/${userId}/${swipedUser.uid}`);
            await set(swipesRef, { match: true });

            Alert.alert("Match!", `You liked ${swipedUser.name}'s profile.`);
        } catch (error) {
            console.error("Error saving swipe:", error);
        }

        // Move to the next profile
        setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    const handleSwipeLeft = () => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    if (currentIndex >= profiles.length) {
        return (
            <View style={globalStyles.container}>
                <Text style={globalStyles.title}>No more profiles</Text>
            </View>
        );
    }

    const currentProfile = profiles[currentIndex];

    return (
        <View style={globalStyles.container}>
            {currentProfile ? (
                <>
                    <Image
                        source={{ uri: currentProfile.userPicks?.images?.[0] }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.name}>{currentProfile.name}, {new Date().getFullYear() - new Date(currentProfile.dob).getFullYear()}</Text>
                    <Text style={styles.about}>{currentProfile.aboutMe}</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleSwipeLeft} style={styles.noButton}>
                            <Text style={styles.noText}>Not Interested</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSwipeRight} style={styles.yesButton}>
                            <Text style={styles.yesText}>Match!</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <Text>No profiles found</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    profileImage: {
        width: 300,
        height: 300,
        borderRadius: 150,
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    about: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    noButton: {
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 8,
    },
    yesButton: {
        padding: 10,
        backgroundColor: 'green',
        borderRadius: 8,
    },
    noText: {
        color: 'white',
    },
    yesText: {
        color: 'white',
    },
});

export default Swipe;
