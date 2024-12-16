import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';
import { Menu, MenuItem } from 'react-native-material-menu';

const MyProfile = ({ navigation }) => {
    const [userData, setUserData] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [hasListing, setHasListing] = useState(false); // Track if the user has a listing

    useEffect(() => {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        const listingsRef = ref(database, `listings/${auth.currentUser.uid}`);

        // Fetch user data
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            setUserData(data);
            setProfileImage(data?.userPicks?.images?.[0] || null); // Get the first image if available
        });

        // Check if the user has a listing
        onValue(listingsRef, (snapshot) => {
            setHasListing(snapshot.exists());
        });
    }, []);

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                navigation.replace('Home'); // Replace with your login screen
            })
            .catch((error) => {
                Alert.alert('Logout Error', error.message);
            });
    };

    const toggleMenu = () => setMenuVisible(!menuVisible);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <View style={globalStyles.backAndLogoContainerMyProfile}>
                <TouchableOpacity onPress={handleLogout} style={globalStyles.backButton}>
                    <Text style={globalStyles.logoutText}>Log ud</Text>
                </TouchableOpacity>
                <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                <Menu
                    visible={menuVisible}
                    anchor={
                        <TouchableOpacity onPress={toggleMenu} style={globalStyles.menuButton}>
                            <Text style={globalStyles.menuText}>☰</Text>
                        </TouchableOpacity>
                    }
                    onRequestClose={toggleMenu}
                >
                    <MenuItem onPress={() => { setMenuVisible(false); navigation.navigate('EditProfile'); }}>
                        Edit Profile
                    </MenuItem>
                    <MenuItem onPress={() => { setMenuVisible(false); navigation.navigate('PhotoManager'); }}>
                        Manage Pictures
                    </MenuItem>
                    {!userData.hasPlace && (
                        <MenuItem onPress={() => { setMenuVisible(false); navigation.navigate('FilterPage'); }}>
                            Find a Place
                        </MenuItem>
                    )}
                </Menu>
            </View>

            <View style={[globalStyles.container, styles.profileContainer]}>
                <View style={styles.imageWrapper}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                        <Image
                            source={require('../assets/Logo.png')}
                            style={styles.profileImage}
                        />
                    )}
                </View>

                <Text style={styles.nameText}>
                    {`${userData.name || 'Navn ikke angivet'}, ${
                        userData.dob ? new Date(userData.dob).getFullYear() : 'Alder ikke angivet'
                    }`}
                </Text>
                <Text style={styles.aboutMe}>{userData.aboutMe || 'Ingen beskrivelse tilføjet.'}</Text>

                {userData.hasPlace && (
                    <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('Swipe')}>
                        <Text style={globalStyles.buttonText}>Find din nye roomie</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('Matches')}>
                    <Text style={globalStyles.buttonText}>Se dine matches</Text>
                </TouchableOpacity>

                {/* Conditionally render the button */}
                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={() => navigation.navigate(hasListing ? 'MyListing' : 'CreateListing')}
                >
                    <Text style={globalStyles.buttonText}>
                        {hasListing ? 'Se lejemål' : 'Opret lejemål'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    profileContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    imageWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#49ACD0',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0097B2',
        marginBottom: 10,
    },
    aboutMe: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default MyProfile;
