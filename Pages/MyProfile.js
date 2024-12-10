import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Touchable, SafeAreaView } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database, auth } from '../Component/firebase';
import { globalStyles } from './Styles';



const MyProfile = ({navigation}) => {
    const [userData, setUserData] = useState({});
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            setUserData(data);
            setProfileImage(data?.userPicks?.images?.[0] || null); // Get the first image if available
        });
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff"}}>
        <View style={[globalStyles.container, styles.profileContainer]}>
            <View style={globalStyles.backAndLogoContainer}>
          <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
            <Text style={globalStyles.backButton}> ← Tilbage</Text>
          </TouchableOpacity>
          <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
        </View>
            {/* Profile Picture */}
            <View style={styles.imageWrapper}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                    <Image
                        source={require('../assets/Logo.png')} // Replace with your placeholder image
                        style={styles.profileImage}
                    />
                )}
            </View>

            {/* User Information */}
            <Text style={styles.nameText}>{`${userData.name || 'Navn ikke angivet'}, ${userData.dob ? new Date(userData.dob).getFullYear() : 'Alder ikke angivet'}`}</Text>
            <Text style={styles.aboutMe}>{userData.aboutMe || 'Ingen beskrivelse tilføjet.'}</Text>
            

            {/* Tags (example based on user's hasPlace) */}
            <View style={styles.tagContainer}>
                {userData.hasPlace && <Text style={styles.tag}>Har værelse</Text>}
                <Text style={styles.tag}>Søger roommate</Text>
                <Text style={styles.tag}>Mega sej</Text>
            </View>

            {/* Find New Roomie Button - navigerer til swipe for udlejer */}
            {userData.hasPlace && (
            <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('Swipe')}>
                <Text style={globalStyles.buttonText}>Find din nye roomie</Text>
            </TouchableOpacity>
            )}
            {/* Find roomie navigerer til liste over lejemål for lejer */}
             {!userData.hasPlace && (
            <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('AllListings')}>
                <Text style={globalStyles.buttonText}>Find din nye roomie</Text>
            </TouchableOpacity>
            )}
            {/* "Mit lejemål" kun synlig hvis udlejer profil */}
            {userData.hasPlace && (
            <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('MyListing')}>
                <Text style={globalStyles.buttonText}>Mit lejemål</Text>
            </TouchableOpacity>
            )}
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
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    tag: {
        backgroundColor: '#49ACD0',
        color: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        margin: 5,
        fontSize: 14,
    },
});

export default MyProfile;
