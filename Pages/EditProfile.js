import React, { useState, useEffect } from 'react';
import {View, TextInput, Text, TouchableOpacity, Alert, ScrollView, Image, SafeAreaView} from 'react-native';
import { ref, update, onValue } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';

const EditProfile = ({ navigation }) => {
    const [name, setName] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [profession, setProfession] = useState('');

    useEffect(() => {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setName(data.name || '');
                setAboutMe(data.aboutMe || '');
                setPhoneNumber(data.phoneNumber || '');
                setHobbies(data.details?.hobbies || '');
                setProfession(data.details?.profession || '');
            }
        });
    }, []);

    const handleSave = () => {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        update(userRef, {
            name,
            aboutMe,
            phoneNumber,
            details: {
                hobbies,
                profession,
            },
        })
            .then(() => {
                Alert.alert('Success', 'Profil opdateret!');
                navigation.goBack();
            })
            .catch((error) => {
                Alert.alert('Fejl', error.message);
            });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <ScrollView contentContainerStyle={globalStyles.container}>
            <View style={globalStyles.backAndLogoContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
                    <Text style={globalStyles.backButton}>← Tilbage</Text>
                </TouchableOpacity>
                <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
            </View>
            <Text style={globalStyles.label}>Name</Text>
            <TextInput
                style={globalStyles.input}
                value={name}
                onChangeText={setName}
            />

            <Text style={globalStyles.label}>Om Mig</Text>
            <TextInput
                style={globalStyles.inputBio}
                value={aboutMe}
                onChangeText={setAboutMe}
                multiline
            />

            <Text style={globalStyles.label}>Telefonnummer</Text>
            <TextInput
                style={globalStyles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
            />

            <Text style={globalStyles.label}>Hobbyer</Text>
            <TextInput
                style={globalStyles.input}
                value={hobbies}
                onChangeText={setHobbies}
            />

            <Text style={globalStyles.label}>Profession</Text>
            <TextInput
                style={globalStyles.input}
                value={profession}
                onChangeText={setProfession}
            />

            <TouchableOpacity style={globalStyles.button} onPress={handleSave}>
                <Text style={globalStyles.buttonText}>Gem</Text>
            </TouchableOpacity>
        </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfile;
