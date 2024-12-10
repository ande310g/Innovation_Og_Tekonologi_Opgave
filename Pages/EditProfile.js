import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
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
                Alert.alert('Success', 'Profile updated successfully!');
                navigation.goBack();
            })
            .catch((error) => {
                Alert.alert('Error', error.message);
            });
    };

    return (
        <ScrollView contentContainerStyle={globalStyles.container}>
            <Text style={globalStyles.label}>Name</Text>
            <TextInput
                style={globalStyles.input}
                value={name}
                onChangeText={setName}
            />

            <Text style={globalStyles.label}>About Me</Text>
            <TextInput
                style={globalStyles.inputBio}
                value={aboutMe}
                onChangeText={setAboutMe}
                multiline
            />

            <Text style={globalStyles.label}>Phone Number</Text>
            <TextInput
                style={globalStyles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
            />

            <Text style={globalStyles.label}>Hobbies</Text>
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
                <Text style={globalStyles.buttonText}>Save</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default EditProfile;
