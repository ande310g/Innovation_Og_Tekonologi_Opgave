import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
    Image,
    Platform,
    SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as ImageManipulator from 'expo-image-manipulator';
import { database, auth, storage } from '../Component/firebase';
import { ref, update, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { globalStyles } from './Styles';
import DismissKeyboardWrapper from '../Component/DismissKeyboardWrapper';

// Komponent til håndtering af brugerens profilbilleder
const PhotoManager = ({ navigation }) => {
    const [selectedImages, setSelectedImages] = useState([]); // State til valgte billeder
    const [uploading, setUploading] = useState(false); // State til at indikere upload-status

    // Henter brugerens eksisterende billeder fra Firebase ved første rendering
    useEffect(() => {
        const fetchUserImages = async () => {
            if (!auth.currentUser) return; // Stop, hvis ingen bruger er logget ind
            const userRef = ref(database, `users/${auth.currentUser.uid}/userPicks`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                setSelectedImages(snapshot.val().images || []); // Henter gemte billeder
            }
        };
        fetchUserImages();
    }, []);

    // Funktion til at vælge billeder fra enhedens kamerarulle
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Tilladelse påkrævet", "Giv adgang til billeder for at tilføje dem!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.5, // Reduceret billedkvalitet for bedre performance
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setSelectedImages((prevImages) => [
                ...prevImages,
                ...newImages.filter(uri => !prevImages.includes(uri)), // Undgår dubletter
            ]);
        }
    };

    // Komprimerer billeder før upload for at reducere filstørrelse
    const compressImage = async (uri) => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Reducerer bredden
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipulatedImage.uri;
    };

    // Funktion til at uploade billeder til Firebase Storage
    const uploadImageToStorage = async (imageUri) => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = `image_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
        const storageReference = storageRef(storage, `userImages/${auth.currentUser.uid}/${fileName}`);
        await uploadBytes(storageReference, blob); // Uploader billedet som en blob
        return await getDownloadURL(storageReference); // Henter URL til det uploadede billede
    };

    // Funktion til at gemme alle valgte billeder i Firebase
    const handleSaveData = async () => {
        if (uploading || !auth.currentUser) return;
        setUploading(true);
        try {
            const uniqueUris = Array.from(new Set(selectedImages)); // Undgår dubletter
            const uploadedUrls = [];

            // Uploader hvert billede til Firebase Storage
            for (let uri of uniqueUris) {
                const compressedUri = await compressImage(uri);
                const url = await uploadImageToStorage(compressedUri);
                uploadedUrls.push(url);
            }

            // Opdaterer Firebase med de uploadede billed-URL'er
            const userRef = ref(database, `users/${auth.currentUser.uid}/userPicks`);
            await update(userRef, { images: uploadedUrls });
            Alert.alert("Succes", "Billederne blev gemt!");
        } catch (error) {
            console.error("Fejl ved lagring af billeder:", error);
            Alert.alert("Fejl", "Kunne ikke gemme billederne.");
        } finally {
            setUploading(false);
        }
    };

    // Funktion til at slette et billede
    const handleDeleteImage = async (imageUri) => {
        if (uploading || !auth.currentUser) return;

        Alert.alert(
            "Slet billede",
            "Er du sikker på, at du vil slette dette billede?",
            [
                { text: "Annuller", style: "cancel" },
                {
                    text: "Slet",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updatedImages = selectedImages.filter((uri) => uri !== imageUri);
                            const userRef = ref(database, `users/${auth.currentUser.uid}/userPicks`);
                            await update(userRef, { images: updatedImages });
                            setSelectedImages(updatedImages); // Opdaterer billederne i UI
                            Alert.alert("Succes", "Billede slettet.");
                        } catch (error) {
                            console.error("Fejl ved sletning af billede:", error);
                            Alert.alert("Fejl", "Kunne ikke slette billedet.");
                        }
                    },
                },
            ]
        );
    };

    // Funktion til at downloade og dele et billede
    const handleDownloadImage = async (imageUri) => {
        try {
            const fileUri = `${FileSystem.documentDirectory}${imageUri.split('/').pop()}`;
            const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);

            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                await Sharing.shareAsync(downloadResult.uri);
            } else {
                Alert.alert("Succes", "Billede downloadet.");
            }
        } catch (error) {
            console.error("Fejl ved download:", error);
            Alert.alert("Fejl", "Kunne ikke downloade billedet.");
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <DismissKeyboardWrapper>
                <View style={globalStyles.container}>
                    {/* Header med tilbage-knap og logo */}
                    <View style={globalStyles.backAndLogoContainer}>
                        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={globalStyles.backButton}> ← Tilbage</Text>
                        </TouchableOpacity>
                        <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                    </View>

                    <Text style={globalStyles.title}>Rediger billeder på din profil</Text>

                    {/* Knappen til at vælge billeder */}
                    <TouchableOpacity onPress={pickImage} style={globalStyles.button}>
                        <Text style={globalStyles.buttonText}>Tilføj billeder</Text>
                    </TouchableOpacity>

                    {/* Viser de valgte billeder */}
                    <FlatList
                        data={selectedImages}
                        renderItem={({ item }) => (
                            <View style={{ flex: 1, margin: 5, position: 'relative' }}>
                                <Image
                                    source={{ uri: item }}
                                    style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }}
                                />
                                {/* Slet billede */}
                                <TouchableOpacity onPress={() => handleDeleteImage(item)} style={styles.deleteButton}>
                                    <Text style={{ color: 'white', fontSize: 14 }}>✕</Text>
                                </TouchableOpacity>
                                {/* Download billede */}
                                <TouchableOpacity onPress={() => handleDownloadImage(item)} style={styles.downloadButton}>
                                    <Text style={{ color: 'white', fontSize: 14 }}>⇩</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        keyExtractor={(item, index) => `${item}_${index}`}
                        numColumns={3}
                        contentContainerStyle={{ justifyContent: 'center', paddingHorizontal: 10 }}
                    />

                    {/* Gem-knap */}
                    {selectedImages.length > 0 && (
                        <TouchableOpacity style={globalStyles.button} onPress={handleSaveData} disabled={uploading}>
                            <Text style={globalStyles.buttonText}>{uploading ? "Oploader..." : "Gem ændringer"}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </DismissKeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = {
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
        padding: 5,
    },
    downloadButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
        padding: 5,
    },
};

export default PhotoManager;
