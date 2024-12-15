import React, { useEffect, useState } from 'react';
import {View, Text, Image, FlatList, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../Component/firebase';
import { globalStyles } from './Styles';

const UserDetail = ({ route, navigation }) => {
    const { userId } = route.params;
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userRef = ref(database, `users/${userId}`);
        const unsubscribe = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            setUserDetails(data);
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup
    }, [userId]);

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
        <ScrollView contentContainerStyle={globalStyles.container}>
            <View style={globalStyles.backAndLogoContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
                    <Text style={globalStyles.backButton}>← Tilbage</Text>
                </TouchableOpacity>
                <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
            </View>
            <Text style={globalStyles.title}>{userDetails.name}</Text>
            <Text style={globalStyles.label}>About Me</Text>
            <Text style={globalStyles.text}>{userDetails.aboutMe}</Text>

            <Text style={globalStyles.label}>Additional Details</Text>
            <Text style={globalStyles.text}>Phone: {userDetails.phoneNumber}</Text>
            <Text style={globalStyles.text}>Lifestyle: {userDetails.details?.aboutLifestyle}</Text>
            <Text style={globalStyles.text}>Hobbies: {userDetails.details?.hobbies}</Text>
            <Text style={globalStyles.text}>Profession: {userDetails.details?.profession}</Text>

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
                contentContainerStyle={globalStyles.grid}
            />
        </ScrollView>
        </SafeAreaView>
    );
};

export default UserDetail;
