import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { database, auth, storage } from '../Component/firebase';
import { ref, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { globalStyles } from './Styles';
import DismissKeyboardWrapper from "../Component/DismissKeyboardWrapper";

// Komponent til at vælge og uploade billeder til brugerens profil
const UserImagePicker = ({ navigation }) => {
    // State til at holde valgte billeder og upload-status
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Funktion til at åbne billedvælger og vælge billeder
    const pickImage = async () => {
        // Beder om tilladelse til at tilgå mediebiblioteket
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Tilladelse påkrævet", "Du skal give adgang til billeder for at vælge dem!");
            return;
        }

        // Starter billedvælgeren
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Kun billeder tillades
            allowsMultipleSelection: true, // Tillader flere billeder
            quality: 0.5, // Reducerer billedkvalitet for at spare plads
        });
        console.log('Image Picker Result:', result);

        // Tilføjer valgte billeder til state
        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri).filter(uri => !!uri); // Sikrer gyldige URIs
            setSelectedImages((prevImages) => [
                ...prevImages,
                ...newImages.filter(uri => !prevImages.includes(uri)), // Undgår dubletter
            ]);
        } else {
            console.log('Ingen billeder valgt');
        }
    };

    // Funktion til at komprimere billeder før upload
    const compressImage = async (uri) => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Ændrer billedets bredde til 800px
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Reducerer kvalitet og gemmer som JPEG
        );
        return manipulatedImage.uri; // Returnerer den komprimerede billed-URI
    };

    // Funktion til at uploade et enkelt billede til Firebase Storage
    const uploadImageToStorage = async (imageUri) => {
        const response = await fetch(imageUri);
        const blob = await response.blob(); // Konverterer billedet til en blob for upload
        const fileName = `image_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
        const storageReference = storageRef(storage, `userImages/${auth.currentUser.uid}/${fileName}`); // Sti til lagring i Firebase Storage
        await uploadBytes(storageReference, blob); // Uploader billedet
        return await getDownloadURL(storageReference); // Returnerer billedets download-URL
    };

    // Funktion til at uploade flere billeder samlet
    const uploadBatchedImages = async (imageUris) => {
        const uniqueUris = Array.from(new Set(imageUris)); // Sikrer unikke URIs
        const uploadedUrls = [];
        for (let i = 0; i < uniqueUris.length; i++) {
            const compressedUri = await compressImage(uniqueUris[i]); // Komprimer billedet
            const url = await uploadImageToStorage(compressedUri); // Upload billedet og hent URL
            uploadedUrls.push(url); // Tilføj URL til listen
        }
        return uploadedUrls; // Returnerer alle uploadede URL'er
    };

    // Funktion til at gemme billed-URL'er i Firebase Realtime Database
    const handleSaveData = async () => {
        if (uploading || !auth.currentUser) return; // Undgår gentagne uploads
        setUploading(true); // Sætter upload-status til sandt
        try {
            const imageUrls = await uploadBatchedImages(selectedImages); // Uploader billederne
            const userRef = ref(database, `users/${auth.currentUser.uid}/userPicks`); // Reference til brugerens data i databasen
            await update(userRef, { images: imageUrls }); // Opdaterer databasen med billed-URL'er
            Alert.alert("Succes", "Billederne er gemt på din profil!");
            setSelectedImages([]); // Nulstiller billedlisten efter upload
            navigation.navigate('DetailedAboutYou'); // Navigerer til næste skærm
        } catch (error) {
            console.error("Fejl ved lagring af billeder:", error);
            Alert.alert("Fejl", "Kunne ikke gemme billederne.");
        } finally {
            setUploading(false); // Nulstiller upload-status
        }
    };

    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                {/* Titel */}
                <Text style={globalStyles.title}>Vælg billeder til din profil</Text>

                {/* Knappen til at vælge billeder */}
                <TouchableOpacity onPress={pickImage} style={globalStyles.button}>
                    <Text style={globalStyles.buttonText}>Vælg fra kamerarulle</Text>
                </TouchableOpacity>

                {/* Viser valgte billeder i en grid (3 kolonner) */}
                {selectedImages.length > 0 && (
                    <FlatList
                        data={selectedImages}
                        renderItem={({ item }) => (
                            <View style={{ flex: 1, margin: 5 }}>
                                <Image
                                    source={{ uri: item }} // Viser billedet
                                    style={{
                                        width: '100%',
                                        aspectRatio: 1, // Holder billedet kvadratisk
                                        borderRadius: 8,
                                    }}
                                />
                            </View>
                        )}
                        keyExtractor={(item, index) => `${item}_${index}`} // Unik nøgle for hvert billede
                        numColumns={3} // Grid-layout med 3 kolonner
                        contentContainerStyle={{
                            justifyContent: 'center',
                            paddingHorizontal: 10,
                        }}
                    />
                )}

                {/* Knappen til at uploade valgte billeder */}
                {selectedImages.length > 0 && (
                    <TouchableOpacity
                        style={globalStyles.button}
                        onPress={handleSaveData}
                        disabled={uploading} // Deaktiverer knappen under upload
                    >
                        <Text style={globalStyles.buttonText}>{uploading ? "Uploader..." : "Gem billeder"}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </DismissKeyboardWrapper>
    );
};

export default UserImagePicker;
