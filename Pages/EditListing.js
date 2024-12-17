import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, Image, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { globalStyles } from './Styles';

const EditListing = ({ route, navigation }) => {
  const { listingId } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    const fetchListing = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const listingRef = ref(db, `listings/${user.uid}/${listingId}`);

        try {
          const snapshot = await get(listingRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setListing(data);
            setSelectedImages(data.images || []);
          } else {
            Alert.alert("Error", "Listing not found");
            navigation.goBack();
          }
        } catch (error) {
          Alert.alert("Error", "Could not fetch listing details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchListing();
  }, [listingId, navigation]);

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
      const newUris = result.assets.map(asset => asset.uri);
      setSelectedImages((prev) => [...prev, ...newUris]);
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

  const uploadImageToStorage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `listing_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
    const storageReference = storageRef(getStorage(), `listings/${getAuth().currentUser.uid}/${fileName}`);
    await uploadBytes(storageReference, blob);
    return await getDownloadURL(storageReference);
  };

  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && listing) {
      setLoading(true);
      const db = getDatabase();
      const listingRef = ref(db, `listings/${user.uid}/${listingId}`);

      try {
        // Compress and upload new images
        const uploadedUrls = [];
        for (const uri of selectedImages) {
          if (uri.startsWith('file://')) { // New local image
            const compressedUri = await compressImage(uri);
            const url = await uploadImageToStorage(compressedUri);
            uploadedUrls.push(url);
          } else {
            uploadedUrls.push(uri); // Existing URL
          }
        }

        const updatedListing = {
          ...listing,
          images: uploadedUrls,
        };

        await update(listingRef, updatedListing);
        Alert.alert("Success", "Listing updated successfully");
        navigation.goBack();
      } catch (error) {
        console.error("Update failed:", error);
        Alert.alert("Error", "Failed to update listing");
      } finally {
        setLoading(false);
      }
    }
  };

  const removeImage = (uriToRemove) => {
    setSelectedImages((prevImages) => prevImages.filter((uri) => uri !== uriToRemove));
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={globalStyles.container}>
        <View style={globalStyles.backAndLogoContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
            <Text style={globalStyles.backButton}>← Tilbage</Text>
          </TouchableOpacity>
          <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
        </View>

        <Text style={globalStyles.title}>Rediger opslag</Text>
        <TextInput
          placeholder="Title"
          value={listing?.title || ''}
          onChangeText={(text) => setListing({ ...listing, title: text })}
          style={globalStyles.input}
        />
        <TextInput
          placeholder="Description"
          value={listing?.description || ''}
          onChangeText={(text) => setListing({ ...listing, description: text })}
          style={globalStyles.input}
        />
        <TextInput
          placeholder="Size"
          value={listing?.size?.toString() || ''}
          onChangeText={(text) => setListing({ ...listing, size: text })}
          style={globalStyles.input}
          keyboardType="number-pad"
        />
        <TextInput
          placeholder="Price"
          value={listing?.price?.toString() || ''}
          onChangeText={(text) => setListing({ ...listing, price: text })}
          style={globalStyles.input}
          keyboardType="number-pad"
        />

        {/* Image Section */}
        <TouchableOpacity style={globalStyles.button} onPress={pickImages}>
          <Text style={globalStyles.buttonText}>Update Images</Text>
        </TouchableOpacity>

        {/* Image Preview with Delete */}
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

        <TouchableOpacity style={globalStyles.button} onPress={handleSave}>
          <Text style={globalStyles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditListing;