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
            const userSwipesRef = ref(database, `matches/${userId}/${swipedUser.uid}`);
            const swipedUserMatchesRef = ref(database, `matches/${swipedUser.uid}/${userId}`);
            const matchData = { name: swipedUser.name };

            await set(userSwipesRef, matchData);
            await set(swipedUserMatchesRef, { name: auth.currentUser.displayName });

            Alert.alert('Match!', `You matched with ${swipedUser.name}.`);
        } catch (error) {
            console.error('Error saving match:', error);
        }

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
                    <Image
                        source={
                            currentProfile.userPicks?.images?.[0]  ? { uri: currentProfile.userPicks?.images?.[0] } 
                            : require('../assets/Pfp.png')
                        }
                        style={globalStyles.profileImage}
                    />
                    <Text style={globalStyles.name}>{currentProfile.name}, {new Date().getFullYear() - new Date(currentProfile.dob).getFullYear()}</Text>
                    <Text style={globalStyles.about}>{currentProfile.aboutMe}</Text>

                    <View style={globalStyles.actions}>
                        <TouchableOpacity onPress={handleSwipeLeft} style={globalStyles.noButton}>
                            <Text style={globalStyles.buttonText}> Nej tak</Text>
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
