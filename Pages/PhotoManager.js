import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, Platform, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as ImageManipulator from 'expo-image-manipulator';
import { database, auth, storage } from '../Component/firebase';
import { ref, update, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { globalStyles } from './Styles';
import DismissKeyboardWrapper from '../Component/DismissKeyboardWrapper';

const PhotoManager = ({ navigation }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchUserImages = async () => {
            if (!auth.currentUser) return;
            const userRef = ref(database, `users/${auth.currentUser.uid}/userPicks`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                setSelectedImages(snapshot.val().images || []);
            }
        };
        fetchUserImages();
    }, []);

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

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri).filter(uri => !!uri);
            setSelectedImages((prevImages) => [
                ...prevImages,
                ...newImages.filter(uri => !prevImages.includes(uri)),
            ]);
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

    const handleSaveData = async () => {
        if (uploading || !auth.currentUser) return;
        setUploading(true);
        try {
            const uniqueUris = Array.from(new Set(selectedImages));
            const uploadedUrls = [];
            for (let uri of uniqueUris) {
                const compressedUri = await compressImage(uri);
                const url = await uploadImageToStorage(compressedUri);
                uploadedUrls.push(url);
            }

            const userRef = ref(database, `users/${auth.currentUser.uid}/userPicks`);
            await update(userRef, { images: uploadedUrls });
            Alert.alert("Success", "Successfully saved the images!");
        } catch (error) {
            console.error("Error saving images:", error);
            Alert.alert("Error", "Failed to save the images.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageUri) => {
        if (uploading || !auth.currentUser) return;

        Alert.alert(
            "Delete Image",
            "Are you sure you want to delete this image?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updatedImages = selectedImages.filter((uri) => uri !== imageUri);
                            const userRef = ref(database, `users/${auth.currentUser.uid}/userPicks`);
                            await update(userRef, { images: updatedImages });
                            setSelectedImages(updatedImages);
                            Alert.alert("Success", "Image deleted successfully.");
                        } catch (error) {
                            console.error("Error deleting image:", error);
                            Alert.alert("Error", "Failed to delete the image.");
                        }
                    },
                },
            ]
        );
    };

    const handleDownloadImage = async (imageUri) => {
        try {
            const fileUri = `${FileSystem.documentDirectory}${imageUri.split('/').pop()}`;
            const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);

            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                await Sharing.shareAsync(downloadResult.uri);
            } else {
                Alert.alert("Success", "Image downloaded successfully.");
            }
        } catch (error) {
            console.error("Error downloading image:", error);
            Alert.alert("Error", "Failed to download the image.");
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                 <View style={globalStyles.backAndLogoContainer}>
                          <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={globalStyles.backButton}> ← Tilbage</Text>
                          </TouchableOpacity>
                          <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
                        </View>
                <Text style={globalStyles.title}>Manage Your Profile Photos</Text>

                <TouchableOpacity onPress={pickImage} style={globalStyles.button}>
                    <Text style={globalStyles.buttonText}>Add New Photos</Text>
                </TouchableOpacity>

                <FlatList
                    data={selectedImages}
                    renderItem={({ item }) => (
                        <View style={{ flex: 1, margin: 5, position: 'relative' }}>
                            <Image
                                source={{ uri: item }}
                                style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }}
                            />
                            <TouchableOpacity
                                onPress={() => handleDeleteImage(item)}
                                style={{
                                    position: 'absolute',
                                    top: 5,
                                    right: 5,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: 50,
                                    padding: 5,
                                }}
                            >
                                <Text style={{ color: 'white', fontSize: 14 }}>✕</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleDownloadImage(item)}
                                style={{
                                    position: 'absolute',
                                    bottom: 5,
                                    right: 5,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: 50,
                                    padding: 5,
                                }}
                            >
                                <Text style={{ color: 'white', fontSize: 14 }}>⇩</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item, index) => `${item}_${index}`}
                    numColumns={3}
                    contentContainerStyle={{ justifyContent: 'center', paddingHorizontal: 10 }}
                />

                {selectedImages.length > 0 && (
                    <TouchableOpacity
                        style={globalStyles.button}
                        onPress={handleSaveData}
                        disabled={uploading}
                    >
                        <Text style={globalStyles.buttonText}>{uploading ? "Uploading..." : "Save Changes"}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </DismissKeyboardWrapper>
        </SafeAreaView>
    );
};

export default PhotoManager;