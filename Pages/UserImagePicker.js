import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
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

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission required", "Permission to access the photo roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.5,
        });
        console.log('Image Picker Result:', result);

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri).filter(uri => !!uri); // Ensure valid URIs
            setSelectedImages((prevImages) => [
                ...prevImages,
                ...newImages.filter(uri => !prevImages.includes(uri)), // Avoid duplicates
            ]);
        } else {
            console.log('No images selected');
        }
    };



    const compressImage = async (uri) => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipulatedImage.uri;
    };

    const uploadImageToStorage = async (imageUri) => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = `image_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
        const storageReference = storageRef(storage, `userImages/${auth.currentUser.uid}/${fileName}`);
        await uploadBytes(storageReference, blob);
        return await getDownloadURL(storageReference);
    };

    const uploadBatchedImages = async (imageUris) => {
        const uniqueUris = Array.from(new Set(imageUris)); // Ensure unique URIs
        const uploadedUrls = [];
        for (let i = 0; i < uniqueUris.length; i++) {
            const compressedUri = await compressImage(uniqueUris[i]);
            const url = await uploadImageToStorage(compressedUri);
            uploadedUrls.push(url);
        }
        return uploadedUrls;
    };

    const handleSaveData = async () => {
        if (uploading || !auth.currentUser) return;
        setUploading(true);
        try {
            const imageUrls = await uploadBatchedImages(selectedImages);
            const userRef = ref(database, `users/${auth.currentUser.uid}/userPicks`);
            await update(userRef, { images: imageUrls });
            Alert.alert("Success", "Successfully saved the images your profile!");
            setSelectedImages([]); // Reset after successful upload
            navigation.navigate('DetailedAboutYou');
        } catch (error) {
            console.error("Error saving images:", error);
            Alert.alert("Error", "Failed to save the images.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                <Text style={globalStyles.title}>Choose Images for Your Profile</Text>
                <TouchableOpacity onPress={pickImage} style={globalStyles.button}>
                    <Text style={globalStyles.buttonText}>Select from Camera Roll</Text>
                </TouchableOpacity>
                {selectedImages.length > 0 && (
                    <FlatList
                        data={selectedImages}
                        renderItem={({ item }) => (
                            <View style={{ flex: 1, margin: 5 }}>
                                <Image
                                    source={{ uri: item }}
                                    style={{
                                        width: '100%',
                                        aspectRatio: 1,
                                        borderRadius: 8,
                                    }}
                                />
                            </View>
                        )}
                        keyExtractor={(item, index) => `${item}_${index}`} // Unique key
                        numColumns={3} // Three columns for a 2x3 grid
                        contentContainerStyle={{
                            justifyContent: 'center',
                            paddingHorizontal: 10,
                        }}
                    />
                )}

                {selectedImages.length > 0 && (
                    <TouchableOpacity
                        style={globalStyles.button}
                        onPress={handleSaveData}
                        disabled={uploading} // Prevent duplicate submissions
                    >
                        <Text style={globalStyles.buttonText}>{uploading ? "Uploading..." : "Submit"}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </DismissKeyboardWrapper>
    );
};

export default UserImagePicker;
