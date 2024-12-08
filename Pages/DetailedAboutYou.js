import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Switch, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { set, ref, getDatabase } from 'firebase/database';
import { globalStyles } from './Styles';

const DetailedAboutYou = ({ navigation }) => {
    const [smoker, setSmoker] = useState(false);
    const [hasPets, setHasPets] = useState(false);
    const [profession, setProfession] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [noiseTolerance, setNoiseTolerance] = useState('');
    const [aboutLifestyle, setAboutLifestyle] = useState('');
    const [error, setError] = useState('');

    const handleSaveDetails = () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!profession || !hobbies || !noiseTolerance || !aboutLifestyle) {
            setError('All fields are required!');
            return;
        }

        if (user) {
            const db = getDatabase();
            set(ref(db, `users/${user.uid}/details`), {
                smoker,
                hasPets,
                profession,
                hobbies,
                noiseTolerance,
                aboutLifestyle,
            })
                .then(() => {
                    console.log('Details saved successfully!');
                    navigation.navigate('MyProfile'); // Navigate back to the previous screen
                })
                .catch((err) => {
                    setError(err.message);
                });
        } else {
            setError('User not logged in!');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={globalStyles.container}>
                    <View style={globalStyles.backAndLogoContainer}>
                        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={globalStyles.backButton}>← Back</Text>
                        </TouchableOpacity>
                        <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                    </View>
                    <Text style={globalStyles.title}>Tell Us About Yourself</Text>

                    <Text style={globalStyles.label}>Profession</Text>
                    <TextInput
                        placeholder="E.g., Software Developer, Student"
                        value={profession}
                        onChangeText={setProfession}
                        style={globalStyles.input}
                    />

                    <Text style={globalStyles.label}>Hobbies</Text>
                    <TextInput
                        placeholder="E.g., Hiking, Cooking"
                        value={hobbies}
                        onChangeText={setHobbies}
                        style={globalStyles.inputBio}
                        multiline
                    />

                    <Text style={globalStyles.label}>Noise Tolerance Level</Text>
                    <TextInput
                        placeholder="E.g., Low, Medium, High"
                        value={noiseTolerance}
                        onChangeText={setNoiseTolerance}
                        style={globalStyles.input}
                    />

                    <Text style={globalStyles.label}>Lifestyle</Text>
                    <TextInput
                        placeholder="Describe your daily routine, habits, etc."
                        value={aboutLifestyle}
                        onChangeText={setAboutLifestyle}
                        style={globalStyles.inputBio}
                        multiline
                    />

                    <View style={globalStyles.switchContainer}>
                        <Text style={globalStyles.switchLabel}>Do you smoke?</Text>
                        <Switch
                            value={smoker}
                            onValueChange={setSmoker}
                            trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                            thumbColor={smoker ? '#007bff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={globalStyles.switchContainer}>
                        <Text style={globalStyles.switchLabel}>Do you have pets?</Text>
                        <Switch
                            value={hasPets}
                            onValueChange={setHasPets}
                            trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                            thumbColor={hasPets ? '#007bff' : '#f4f3f4'}
                        />
                    </View>

                    {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={globalStyles.button} onPress={handleSaveDetails}>
                        <Text style={globalStyles.buttonText}>Save Details</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default DetailedAboutYou;
