import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Switch, Image, KeyboardAvoidingView, ScrollView, Platform, SafeAreaView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { set, ref } from 'firebase/database';
import { auth, database } from '../Component/firebase';
import { globalStyles } from './Styles';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

//TODO: Tilføjelse af tags

const CreateUser = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [hasPlace, setHasPlace] = useState(false);
    const [dob, setDob] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const handleSignUp = () => {
        if (!name || !email || !password || !phoneNumber || !aboutMe) {
            setError('Alle felter skal udfyldes!');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                if (user) {
                    try {
                        set(ref(database, 'users/' + user.uid), {
                            name,
                            dob: dob.toISOString(),
                            hasPlace,
                            aboutMe,
                            phoneNumber,
                        }).then(() => {
                            console.log('User data saved to database');
                            navigation.navigate('UserImagePicker');
                        }).catch((dbError) => {
                            setError(dbError.message);
                        });
                    } catch (err) {
                        setError(err.message);
                    }
                }
            })
            .catch((authError) => {
                setError(authError.message);
            });
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        if (date) {
            setDob(date);
            hideDatePicker();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff"}}>
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={globalStyles.container}>
                    <View style={globalStyles.backAndLogoContainer}>
                        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={globalStyles.backButton}> ← Tilbage</Text>
                        </TouchableOpacity>
                        <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                    </View>
                    
                    <Text style={globalStyles.title}>Opret bruger</Text>

                    <Text style={globalStyles.label}>Navn</Text>
                    <TextInput
                        placeholder="Fornavn og efternavn"
                        value={name}
                        onChangeText={setName}
                        style={globalStyles.input}
                    />

                    <Text style={globalStyles.label}>Fødselsdato</Text>
                    <TouchableOpacity onPress={showDatePicker} style={globalStyles.input}>
                        <Text style={globalStyles.date}>{dob.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                        display="spinner"
                        textColor="black"
                        minimumDate={new Date(1900, 0, 1)}
                        maximumDate={new Date()}
                    />

                    <Text style={globalStyles.label}>Kort om dig</Text>
                    <TextInput
                        placeholder="Fortæl os lidt om dig selv!"
                        value={aboutMe}
                        onChangeText={setAboutMe}
                        style={globalStyles.inputBio}
                        multiline
                    />

                    <Text style={globalStyles.label}>Mailadresse</Text>
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={globalStyles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={globalStyles.label}>Adgangskode</Text>
                    <TextInput
                        placeholder="Adgangskode"
                        value={password}
                        onChangeText={setPassword}
                        style={globalStyles.input}
                        secureTextEntry
                    />

                    <Text style={globalStyles.label}>Telefonnummer</Text>
                    <TextInput
                        placeholder="Telefonnummer"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        style={globalStyles.input}
                        keyboardType="phone-pad"
                    />

                    <View style={globalStyles.Container}>
                        <Text style={globalStyles.switchLabel}>
                            Har du et værelse og leder efter en bofælle, eller leder du efter et sted at bo?
                        </Text>
                        <View style={globalStyles.switchRow}>
                            <Text style={globalStyles.switchText}>
                                {hasPlace ? 'Har et værelse' : 'Leder efter et sted at bo'}
                            </Text>
                            <Switch
                                value={hasPlace}
                                onValueChange={setHasPlace}
                                trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                                thumbColor={hasPlace ? '#007bff' : '#f4f3f4'}
                                style={globalStyles.switch}
                            />
                        </View>
                    </View>

                    {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={globalStyles.button} onPress={handleSignUp}>
                        <Text style={globalStyles.buttonText}>Tilmeld dig</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default CreateUser;
