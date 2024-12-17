import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, Image, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { globalStyles } from './Styles';
//Tilføj mulighed for at ændre på flere dele
// Komponent til at redigere et eksisterende opslag
const EditListing = ({ route, navigation }) => {
  const { listingId } = route.params; // Modtager `listingId` fra navigationens parametre
  const [listing, setListing] = useState(null); // State til at gemme opslagets data
  const [loading, setLoading] = useState(true); // State til at håndtere indlæsningstilstand
  const [selectedImages, setSelectedImages] = useState([]); // Gemmer valgte billeder

  // Henter eksisterende opslag fra Firebase ved første rendering
  useEffect(() => {
    const fetchListing = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const listingRef = ref(db, `listings/${user.uid}/${listingId}`);

        try {
          const snapshot = await get(listingRef); // Henter opslaget fra databasen
          if (snapshot.exists()) {
            const data = snapshot.val();
            setListing(data); // Gemmer opslagets data i state
            setSelectedImages(data.images || []); // Sætter eksisterende billeder
          } else {
            Alert.alert("Fejl", "Opslaget blev ikke fundet");
            navigation.goBack();
          }
        } catch (error) {
          Alert.alert("Fejl", "Kunne ikke hente opslagets detaljer");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchListing();
  }, [listingId, navigation]);

  // Funktion til at vælge nye billeder
  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Tilladelse nægtet", "Giv adgang til fotos for at vælge billeder.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Tillad flere billeder
      quality: 0.5, // Reducer billedkvalitet
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setSelectedImages((prev) => [...prev, ...newUris]); // Tilføjer nye billeder til listen
    }
  };

  // Funktion til at komprimere billeder før upload
  const compressImage = async (uri) => {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Ændrer billedets bredde til 800px
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Reducerer kvalitet og gemmer som JPEG
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
    return await getDownloadURL(storageReference); // Returnerer download-link til billedet
  };

  // Funktion til at gemme ændringer i opslaget
  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && listing) {
      setLoading(true);
      const db = getDatabase();
      const listingRef = ref(db, `listings/${user.uid}/${listingId}`);

      try {
        // Komprimerer og uploader nye billeder
        const uploadedUrls = [];
        for (const uri of selectedImages) {
          if (uri.startsWith('file://')) { // Tjekker om billedet er nyt (lokal URI)
            const compressedUri = await compressImage(uri);
            const url = await uploadImageToStorage(compressedUri);
            uploadedUrls.push(url);
          } else {
            uploadedUrls.push(uri); // Beholder eksisterende billeder
          }
        }

        // Opdaterer opslagets data
        const updatedListing = {
          ...listing,
          images: uploadedUrls,
        };

        await update(listingRef, updatedListing); // Opdaterer opslaget i databasen
        Alert.alert("Succes", "Opslaget er opdateret");
        navigation.goBack(); // Går tilbage til forrige skærm
      } catch (error) {
        console.error("Fejl ved opdatering:", error);
        Alert.alert("Fejl", "Kunne ikke opdatere opslaget");
      } finally {
        setLoading(false);
      }
    }
  };

  // Funktion til at fjerne et billede fra listen
  const removeImage = (uriToRemove) => {
    setSelectedImages((prevImages) => prevImages.filter((uri) => uri !== uriToRemove));
  };

  // Indlæsningsindikator
  if (loading) {
    return (
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Indlæser...</Text>
        </View>
    );
  }

  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <View style={globalStyles.container}>
          {/* Header */}
          <View style={globalStyles.backAndLogoContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
              <Text style={globalStyles.backButton}>← Tilbage</Text>
            </TouchableOpacity>
            <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
          </View>

          {/* Formular til redigering af opslag */}
          <Text style={globalStyles.title}>Rediger opslag</Text>
          <TextInput
              placeholder="Titel"
              value={listing?.title || ''}
              onChangeText={(text) => setListing({ ...listing, title: text })}
              style={globalStyles.input}
          />
          <TextInput
              placeholder="Beskrivelse"
              value={listing?.description || ''}
              onChangeText={(text) => setListing({ ...listing, description: text })}
              style={globalStyles.input}
          />

          {/* Billedvælger */}
          <TouchableOpacity style={globalStyles.button} onPress={pickImages}>
            <Text style={globalStyles.buttonText}>Vælg flere billeder</Text>
          </TouchableOpacity>

          {/* Billedgalleri med fjern-knap */}
          <FlatList
              data={selectedImages}
              renderItem={({ item }) => (
                  <View style={{ margin: 5, position: 'relative' }}>
                    <Image source={{ uri: item }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                    <TouchableOpacity
                        onPress={() => removeImage(item)}
                        style={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          backgroundColor: 'red',
                          borderRadius: 12,
                          padding: 4,
                        }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
                    </TouchableOpacity>
                  </View>
              )}
              keyExtractor={(item, index) => `${item}_${index}`}
              horizontal
          />

          {/* Gem-knap */}
          <TouchableOpacity style={globalStyles.button} onPress={handleSave}>
            <Text style={globalStyles.buttonText}>Gem ændringer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
};

export default EditListing;
