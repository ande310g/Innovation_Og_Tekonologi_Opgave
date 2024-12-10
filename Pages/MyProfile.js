import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';
import { useNavigation } from '@react-navigation/native';

const MyProfile = ({ navigation }) => {
    const [userData, setUserData] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            setUserData(data);
            setProfileImage(data?.userPicks?.images?.[0] || null); // Get the first image if available
        });
    }, []);

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                navigation.replace('Login'); // Replace with your login screen
            })
            .catch((error) => {
                Alert.alert('Logout Error', error.message);
            });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[globalStyles.container, styles.profileContainer]}>
                <TouchableOpacity
                    style={styles.dropdownToggle}
                    onPress={() => setMenuVisible(!menuVisible)}
                >
                    <Text style={styles.menuText}>☰</Text>
                </TouchableOpacity>

                {menuVisible && (
                    <View style={styles.dropdownMenu}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Text style={styles.menuItemText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                            <Text style={styles.menuItemText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                )}

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
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    profileContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    dropdownToggle: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    menuText: {
        fontSize: 24,
        color: '#0097B2',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 5,
    },
    menuItem: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    menuItemText: {
        fontSize: 16,
        color: '#0097B2',
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
