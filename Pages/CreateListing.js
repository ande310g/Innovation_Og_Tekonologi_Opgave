import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, FlatList, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { globalStyles } from "./Styles";

const CreateListing = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [address, setAddress] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Image Picker
  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Allow access to photos to select images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages((prev) => [...prev, ...selectedUris.filter(uri => !prev.includes(uri))]);
    }
  };

  // Compress Image
  const compressImage = async (uri) => {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatedImage.uri;
  };

  // Upload Image to Firebase Storage
  const uploadImageToStorage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `listing_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
    const storageReference = storageRef(getStorage(), `listings/${getAuth().currentUser.uid}/${fileName}`);
    await uploadBytes(storageReference, blob);
    return await getDownloadURL(storageReference);
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!title || !description || !size || !price || !address || !zipcode || !city) {
      Alert.alert("Incomplete Form", "Please fill all required fields.");
      return;
    }

    setUploading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Not Logged In", "You must be logged in to create a listing.");
        return;
      }

      // Compress and Upload Images
      const uploadedImageUrls = [];
      for (const imageUri of images) {
        const compressedUri = await compressImage(imageUri);
        const url = await uploadImageToStorage(compressedUri);
        uploadedImageUrls.push(url);
      }

      // Save Listing Data to Firebase Realtime Database
      const db = getDatabase();
      const listingsRef = ref(db, `listings/${user.uid}`);
      const newListingRef = push(listingsRef);

      await set(newListingRef, {
        title,
        description,
        size: parseInt(size),
        price: parseInt(price),
        deposit: parseInt(deposit),
        address,
        zipcode,
        city,
        images: uploadedImageUrls,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      });

      Alert.alert("Success", "Listing created successfully!");
      navigation.navigate("MyListing");
    } catch (error) {
      console.error("Error creating listing:", error);
      Alert.alert("Error", "Failed to create listing.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={globalStyles.container}>
            <View style={globalStyles.backAndLogoContainer}>
              <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                <Text style={globalStyles.backButton}> ← Tilbage</Text>
              </TouchableOpacity>
            </View>
            <Text style={globalStyles.title}>Opret lejemål</Text>
            
            {/* Form Fields */}
            <Text style={globalStyles.label}>Titel</Text>
            <TextInput style={globalStyles.input} placeholder="Titel" value={title} onChangeText={setTitle} />

            <Text style={globalStyles.label}>Beskrivelse</Text>
            <TextInput style={globalStyles.input} placeholder="Beskrivelse" value={description} onChangeText={setDescription} />

            <Text style={globalStyles.label}>Størrelse (m²)</Text>
            <TextInput style={globalStyles.input} placeholder="Størrelse" value={size} onChangeText={setSize} keyboardType="numeric" />

            <Text style={globalStyles.label}>Månedlig husleje</Text>
            <TextInput style={globalStyles.input} placeholder="Husleje" value={price} onChangeText={setPrice} keyboardType="numeric" />

            <Text style={globalStyles.label}>Depositum</Text>
            <TextInput style={globalStyles.input} placeholder="Depositum" value={deposit} onChangeText={setDeposit} keyboardType="numeric" />

            <Text style={globalStyles.label}>Adresse</Text>
            <TextInput style={globalStyles.input} placeholder="Adresse" value={address} onChangeText={setAddress} />

            <Text style={globalStyles.label}>Postnummer</Text>
            <TextInput style={globalStyles.input} placeholder="Postnummer" value={zipcode} onChangeText={setZipcode} keyboardType="numeric" />

            <Text style={globalStyles.label}>By</Text>
            <TextInput style={globalStyles.input} placeholder="By" value={city} onChangeText={setCity} />

            {/* Image Picker */}
            <TouchableOpacity style={globalStyles.button} onPress={pickImages}>
              <Text style={globalStyles.buttonText}>Vælg billeder</Text>
            </TouchableOpacity>

            {/* Image Preview */}
            {images.length > 0 && (
              <FlatList
                data={images}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={{ width: 100, height: 100, margin: 5, borderRadius: 8 }} />
                )}
                keyExtractor={(item, index) => `${item}_${index}`}
                horizontal
              />
            )}

            {/* Submit Button */}
            <TouchableOpacity style={globalStyles.button} onPress={handleSubmit} disabled={uploading}>
              <Text style={globalStyles.buttonText}>{uploading ? "Uploader..." : "Opret opslag"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateListing;