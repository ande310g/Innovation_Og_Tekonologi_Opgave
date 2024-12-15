import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
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
            const currentUserUid = auth.currentUser.uid;

            // Fetch current user's name from the database
            const currentUserRef = ref(database, `users/${currentUserUid}`);
            let currentUserName = '';

            await onValue(currentUserRef, (snapshot) => {
                const userData = snapshot.val();
                currentUserName = userData?.name || 'Unknown';
            }, { onlyOnce: true });

            // Reference paths for both users
            const currentUserMatchesRef = ref(database, `matches/${currentUserUid}/${swipedUser.uid}`);
            const swipedUserMatchesRef = ref(database, `matches/${swipedUser.uid}/${currentUserUid}`);

            // Data to save for each user
            const currentUserMatchData = {
                name: swipedUser.name,
                role: "seeker", // or "provider" based on the user swiping
            };
            const swipedUserMatchData = {
                name: currentUserName,
                role: "provider", // or "seeker" depending on the swiped user's role
            };

            // Save match for both users
            await set(currentUserMatchesRef, currentUserMatchData);
            await set(swipedUserMatchesRef, swipedUserMatchData);

            Alert.alert('Match!', `You matched with ${swipedUser.name}.`);
        } catch (error) {
            console.error('Error saving match:', error);
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
        <SafeAreaView style={globalStyles.container}>
        <View style={globalStyles.container}>
            <View style={globalStyles.backAndLogoContainer}>
          <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
            <Text style={globalStyles.backButton}> ← Tilbage</Text>
          </TouchableOpacity>
          <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
        </View>
            <View style={globalStyles.profileContainer}>
                {currentProfile ? (
                    <>
                        {/* Button in the top-right corner to navigate to UserDetail */}
                        <TouchableOpacity
                            style={globalStyles.topRightButton}
                            onPress={() => navigation.navigate('UserDetail', { userId: currentProfile.uid })}
                        >
                            <Text style={globalStyles.buttonText}>View Profile</Text>
                        </TouchableOpacity>

                        <Image
                            source={
                                currentProfile.userPicks?.images?.[0]
                                    ? { uri: currentProfile.userPicks?.images?.[0] }
                                    : require('../assets/Pfp.png')
                            }
                            style={globalStyles.profileImage}
                        />
                        <Text style={globalStyles.name}>
                            {currentProfile.name}, {new Date().getFullYear() - new Date(currentProfile.dob).getFullYear()}
                        </Text>
                        <Text style={globalStyles.about}>{currentProfile.aboutMe}</Text>

                        <View style={globalStyles.actions}>
                            <TouchableOpacity onPress={handleSwipeLeft} style={globalStyles.noButton}>
                                <Text style={globalStyles.buttonText}>Nej tak</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSwipeRight} style={globalStyles.yesButton}>
                                <Text style={globalStyles.buttonText}>Match!</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <Text>No profiles found</Text>
                )}
            </View>

        </View>
        </SafeAreaView>
    );
};


export default Swipe;
