import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, FlatList, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { globalStyles } from "./Styles";

const CreateListing = ({ navigation }) => {
  // State til formularfelter og billeder
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [address, setAddress] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState([]); // Gemmer valgte billeder
  const [uploading, setUploading] = useState(false); // Status for upload

  // Funktion til at vælge billeder fra brugerens enhed
  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Tilladelse nægtet", "Giv adgang til fotos for at vælge billeder.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Tillad flere billeder
      quality: 0.5,
    });

    if (!result.canceled) {
      // Filtrerer og tilføjer valgte billeder til state
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages((prev) => [...prev, ...selectedUris.filter(uri => !prev.includes(uri))]);
    }
  };

  // Komprimerer billeder for at reducere størrelse
  const compressImage = async (uri) => {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Ændrer billedets bredde
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Komprimerer og gemmer som JPEG
    );
    return manipulatedImage.uri;
  };

  // Funktion til at uploade billeder til Firebase Storage
  const uploadImageToStorage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob(); // Konverterer billedet til en blob
    const fileName = `listing_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
    const storageReference = storageRef(getStorage(), `listings/${getAuth().currentUser.uid}/${fileName}`);
    await uploadBytes(storageReference, blob); // Uploader billedet til Firebase
    return await getDownloadURL(storageReference); // Henter download-link til billedet
  };

  // Funktion til at oprette et opslag
  const handleSubmit = async () => {
    if (!title || !description || !size || !price || !address || !zipcode || !city) {
      Alert.alert("Ufuldstændig formular", "Udfyld alle påkrævede felter.");
      return;
    }

    setUploading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Ikke logget ind", "Du skal være logget ind for at oprette et opslag.");
        return;
      }

      // Komprimerer og uploader billeder
      const uploadedImageUrls = [];
      for (const imageUri of images) {
        const compressedUri = await compressImage(imageUri);
        const url = await uploadImageToStorage(compressedUri);
        uploadedImageUrls.push(url);
      }

      // Gemmer data i Firebase Realtime Database
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
        images: uploadedImageUrls, // Gemmer billedernes URL'er
        createdAt: new Date().toISOString(), // Gemmer tidspunktet for oprettelse
        userId: user.uid, // Gemmer brugerens ID
      });

      Alert.alert("Succes", "Opslaget er oprettet!");
      navigation.navigate("MyListing"); // Navigerer tilbage til Mine Opslag
    } catch (error) {
      console.error("Fejl ved oprettelse af opslag:", error);
      Alert.alert("Fejl", "Kunne ikke oprette opslag.");
    } finally {
      setUploading(false);
    }
  };

  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={globalStyles.container}>
              {/* Tilbage-knap */}
              <View style={globalStyles.backAndLogoContainer}>
                <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                  <Text style={globalStyles.backButton}> ← Tilbage</Text>
                </TouchableOpacity>
              </View>
              <Text style={globalStyles.title}>Opret lejemål</Text>

              {/* Formularfelter */}
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

              {/* Vælg billeder */}
              <TouchableOpacity style={globalStyles.button} onPress={pickImages}>
                <Text style={globalStyles.buttonText}>Vælg billeder</Text>
              </TouchableOpacity>

              {/* Forhåndsvisning af billeder */}
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

              {/* Opret opslag knap */}
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
