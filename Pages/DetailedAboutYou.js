import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Switch, Image, KeyboardAvoidingView, ScrollView, Platform, SafeAreaView} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
                    navigation.navigate('MyProfile');
                })
                .catch((err) => {
                    setError(err.message);
                });
        } else {
            setError('User not logged in!');
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#ffffff"}}>
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={globalStyles.container}>
                    <View style={globalStyles.backAndLogoContainer}>
                        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={globalStyles.backButton}>← Tilbage</Text>
                        </TouchableOpacity>
                        <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                    </View>
                    <Text style={globalStyles.title}>Fortæl os omkring dig selv</Text>

                    <Text style={globalStyles.label}>Erhverv</Text>
                    <TextInput
                        placeholder="E.g., Software Developer, Student"
                        value={profession}
                        onChangeText={setProfession}
                        style={globalStyles.input}
                    />

                    <Text style={globalStyles.label}>Hobbyer</Text>
                    <TextInput
                        placeholder="E.g., Hiking, Cooking"
                        value={hobbies}
                        onChangeText={setHobbies}
                        style={globalStyles.inputBio}
                        multiline
                    />

                    <Text style={globalStyles.label}>Støj niveau</Text>
                    <View style={[globalStyles.pickerContainer]}>
                        <Picker
                            selectedValue={noiseTolerance}
                            onValueChange={(itemValue) => setNoiseTolerance(itemValue)}

                            mode="dropdown" // Explicitly set dropdown mode
                            dropdownIconColor="black" // Optional: Customize dropdown arrow
                        >
                            <Picker.Item label="Vælg niveau" value="" />
                            <Picker.Item label="Lavt" value="Lavt" />
                            <Picker.Item label="Mellem" value="Mellem" />
                            <Picker.Item label="Højt" value="Højt" />
                        </Picker>
                    </View>
                    <Text style={globalStyles.label}>Livstil</Text>
                    <TextInput
                        placeholder="Describe your daily routine, habits, etc."
                        value={aboutLifestyle}
                        onChangeText={setAboutLifestyle}
                        style={globalStyles.inputBio}
                        multiline
                    />

                    <View style={globalStyles.switchContainer}>
                        <Text style={globalStyles.switchLabel}>Ryger du?</Text>
                        <Switch
                            value={smoker}
                            onValueChange={setSmoker}
                            trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                            thumbColor={smoker ? '#007bff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={globalStyles.switchContainer}>
                        <Text style={globalStyles.switchLabel}>Har du kæledyr?</Text>
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
        </SafeAreaView>
    );
};

export default DetailedAboutYou;
