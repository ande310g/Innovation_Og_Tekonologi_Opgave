import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { ref, onValue, set, get } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';
import { onAuthStateChanged } from 'firebase/auth';

const Swipe = ({ navigation }) => {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const userId = auth.currentUser.uid;

    const [filters, setFilters] = useState(null);

    useEffect(() => {
        const fetchFiltersAndProfiles = async () => {
            const usersRef = ref(database, 'users');
            const listingsRef = ref(database, `listings/${userId}`);
            const swipesRef = ref(database, `swipes/${userId}`);

            try {
                // Fetch the current user's listing details
                const currentListingSnapshot = await get(listingsRef);
                const currentListingDetails = currentListingSnapshot.exists()
                    ? Object.values(currentListingSnapshot.val())[0] // Extract the first listing
                    : null;

                console.log('Current user listing details:', currentListingDetails);

                if (!currentListingDetails) {
                    console.error('No listing details found for current user.');
                    return;
                }

                // Fetch all profiles
                onValue(usersRef, snapshot => {
                    const users = snapshot.val() || {};
                    const availableProfiles = Object.keys(users)
                        .filter(uid => uid !== userId && !users[uid].hasPlace)
                        .map(uid => ({ uid, ...users[uid] }));

                    // Fetch swiped users
                    onValue(swipesRef, swipeSnapshot => {
                        const swipedUsers = swipeSnapshot.val() || {};

                        const filteredProfiles = availableProfiles
                            .filter(profile => !swipedUsers[profile.uid]) // Exclude swiped profiles
                            .filter(profile => applyFilters(profile, currentListingDetails)); // Compare filters

                        setProfiles(filteredProfiles);
                    }, { onlyOnce: true });
                });
            } catch (error) {
                console.error('Error fetching profiles or listings:', error);
            }
        };


        fetchFiltersAndProfiles();
    }, [userId]);


    const applyFilters = (profile, currentListingDetails) => {
        const { filters } = profile;

        console.log('Profile being checked:', profile.uid);
        console.log('Profile filters:', filters);
        console.log('Current user listing details:', currentListingDetails);

        if (!filters) {
            console.log('No filters for this profile, passing through.');
            return true; // Allow profiles without filters
        }

        const { rent, size, areas } = filters;

        const withinRent = rent
            ? currentListingDetails.price >= rent.min && currentListingDetails.price <= rent.max
            : true;

        const withinSize = size
            ? currentListingDetails.size >= size.min && currentListingDetails.size <= size.max
            : true;

        const withinArea = areas?.length
            ? areas.includes(currentListingDetails.city)
            : true;

        console.log('withinRent:', withinRent);
        console.log('withinSize:', withinSize);
        console.log('withinArea:', withinArea);

        const isMatch = withinRent && withinSize && withinArea;
        console.log('Match result for profile:', profile.uid, '=>', isMatch);

        return isMatch;
    };


    const handleSwipeRight = async () => {
        const swipedUser = profiles[currentIndex];
        if (!swipedUser) return;

        try {
            const currentUserUid = auth.currentUser.uid;

            // Fetch current user's name from the database
            const currentUserRef = ref(database, `users/${currentUserUid}`);
            let currentUserName = '';

            await onValue(
                currentUserRef,
                (snapshot) => {
                    const userData = snapshot.val();
                    currentUserName = userData?.name || 'Unknown';
                },
                { onlyOnce: true }
            );

            // Save the swipe in the "swipes" node
            const swipeRef = ref(database, `swipes/${currentUserUid}/${swipedUser.uid}`);
            await set(swipeRef, { matched: true }); // Mark as matched

            // Save the match for both users
            const currentUserMatchesRef = ref(database, `matches/${currentUserUid}/${swipedUser.uid}`);
            const swipedUserMatchesRef = ref(database, `matches/${swipedUser.uid}/${currentUserUid}`);

            const currentUserMatchData = {
                name: swipedUser.name,
                role: swipedUser.hasPlace ? 'seeker' : 'provider',
            };
            const swipedUserMatchData = {
                name: currentUserName,
                role: !swipedUser.hasPlace ? 'seeker' : 'provider',
            };

            await set(currentUserMatchesRef, currentUserMatchData);
            await set(swipedUserMatchesRef, swipedUserMatchData);

            Alert.alert('Match!', `Du matchede med ${swipedUser.name}.`);
        } catch (error) {
            console.error('Error saving match:', error);
        }

        // Move to the next profile
        setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    const handleSwipeLeft = async () => {
        const swipedUser = profiles[currentIndex];
        if (!swipedUser) return;

        try {
            const swipeRef = ref(database, `swipes/${userId}/${swipedUser.uid}`);
            await set(swipeRef, { matched: false });
        } catch (error) {
            console.error('Error handling swipe left:', error);
        }

        setCurrentIndex(prevIndex => prevIndex + 1);
    };

    if (currentIndex >= profiles.length) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
                {/* Back Button and Logo */}
                <View style={globalStyles.container}>
                    <View style={globalStyles.backAndLogoContainer}>
                        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={globalStyles.backButton}> ← Tilbage</Text>
                        </TouchableOpacity>
                        <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                    </View>

                    {/* No More Profiles Message */}
                    <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={globalStyles.title}>No more profiles</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }



    const currentProfile = profiles[currentIndex];


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={globalStyles.container}>
                {/* Back Button and Logo */}
                <View style={globalStyles.backAndLogoContainer}>
                    <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={globalStyles.backButton}> ← Tilbage</Text>
                    </TouchableOpacity>
                    <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                </View>

                {/* Profile or Fallback UI */}
                {currentIndex < profiles.length ? (
                    // Display the current profile
                    <View style={globalStyles.profileContainer}>
                        <TouchableOpacity
                            style={globalStyles.topRightButton}
                            onPress={() => navigation.navigate('UserDetail', { userId: profiles[currentIndex]?.uid })}
                        >
                            <Text style={globalStyles.buttonText}>View Profile</Text>
                        </TouchableOpacity>
                        <Image
                            source={
                                profiles[currentIndex]?.userPicks?.images?.[0]
                                    ? { uri: profiles[currentIndex].userPicks.images[0] }
                                    : require('../assets/Pfp.png')
                            }
                            style={globalStyles.profileImage}
                        />
                        <Text style={globalStyles.name}>
                            {profiles[currentIndex]?.name}, {new Date().getFullYear() - new Date(profiles[currentIndex]?.dob).getFullYear()}
                        </Text>
                        <Text style={globalStyles.about}>{profiles[currentIndex]?.aboutMe}</Text>
                        <View style={globalStyles.actions}>
                            <TouchableOpacity onPress={handleSwipeLeft} style={globalStyles.noButton}>
                                <Text style={globalStyles.buttonText}>Nej tak</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSwipeRight} style={globalStyles.yesButton}>
                                <Text style={globalStyles.buttonText}>Match!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Fallback for no profiles
                    <View style={globalStyles.container}>
                        <Text style={globalStyles.title}>Ikke flere profiler</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );


};

export default Swipe;
