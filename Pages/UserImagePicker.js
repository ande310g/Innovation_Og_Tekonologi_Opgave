import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, Image, FlatList, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { database, auth, storage } from '../Component/firebase';
import { ref, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { globalStyles } from './Styles';
import DismissKeyboardWrapper from "../Component/DismissKeyboardWrapper";

const UserImagePicker = ({ navigation }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);

    const pickImage = async () => {
        console.log('Pick Image function triggered');
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            console.log('issues with access photo roll is required!');
            alert("Permission to access photo roll is required!");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.5,
        });
        console.log('Image picker result:', result);

        if (!result.canceled && result.assets.length <= 6) {
            setSelectedImages((prevImages) => [...prevImages, ...result.assets.map(asset => asset.uri)]);
        } else if (result.assets.length > 6) {
            Alert.alert('Error', 'You can select a maximum of 6 images.');
        }
    };

    const compressImage = async (uri) => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            {compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipulatedImage.uri;
    };

    const uploadImageToStorage = async (imageUri) => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = 'image_' + Math.random().toString(36).substring(2, 15);
        const storageReference = storageRef(storage, `userImages/${auth.currentUser.uid}`);
        await uploadBytes(storageReference, blob);
        return await getDownloadURL(storageReference);
    };

    const uploadBatchedImages = async (imageUri) => {
        const batchSize = 2;
        let batchIndex = 0;
        const uploadedUrls = [];

        while (batchIndex < imageUri.length) {
            const batch = imageUri.slice(batchIndex, batchIndex + batchSize);
            const uploadPromises = batch.map(async (imageUri) => {
                const compressedUri = await compressImage(imageUri);
                return await uploadImageToStorage(compressedUri);
            });
            const batchUrls = await Promise.all(uploadPromises);
            uploadedUrls.push(...batchUrls);
            batchIndex++;
        }
        return uploadedUrls;
    };

    const handleSaveData = async () => {
        const user = auth.currentUser;

        if (user) {
            setUploading(true);
            try {
                const imageUrls = await uploadBatchedImages(selectedImages);
                const userRef = ref(database, `users/${user.uid}/userPicks`);
                await update(userRef, {
                    images: imageUrls
                })
                Alert.alert("Success", "Listing saved successfully!");
                navigation.navigate('MyProfile');
            }
            
            catch (error) {
                console.log('error saving picks', error)
                Alert.alert('Error', 'Failed to save the pictures to the user profile')
            } finally {
                setUploading(false);
            }
        }
    };

    const renderImageItem = ({ item }) => (
        <View>
            <Image source={{ uri: item }} style={globalStyles.image} />
        </View>
    );

    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                <Text style={globalStyles.title}>Vælg billeder til din profil</Text>
                <TouchableOpacity onPress={pickImage} style={globalStyles.button}>
                    <Text style={globalStyles.buttonText}>Vælg fra kamerarulle</Text>
                </TouchableOpacity>
                {selectedImages.length > 0 && (
                    <FlatList
                        data={selectedImages}
                        renderItem={({ item }) => (
                            <View style={{ flex: 1 / 3, margin: 5 }}>
                                <Image
                                    source={{ uri: item }}
                                    style={{
                                        width: '100%',
                                        height: 100, // Adjust height as needed
                                        borderRadius: 8,
                                    }}
                                />
                            </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={3} // Number of columns
                        contentContainerStyle={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 10, // Adjust spacing as needed
                        }}
                    />
                )}


                {selectedImages.length > 0 && (
                    <TouchableOpacity
                        style={globalStyles.button}
                        onPress={handleSaveData}
                        disabled={uploading}
                    >
                        <Text style={globalStyles.buttonText}>{uploading ? "Oploader..." : "Indsend"}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </DismissKeyboardWrapper>
    );
};

export default UserImagePicker;