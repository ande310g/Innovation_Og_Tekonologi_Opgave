import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, FlatList, Modal } from "react-native";
import { getDatabase, ref, push, set } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';

// CreateListing component 
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
  const [selectedImage, setSelectedImage] = useState(null);

  // Save listing to AsyncStorage to store data locally on the device
  const saveToLocalStorage = async (listing) => {
    try {
      await AsyncStorage.setItem("listing", JSON.stringify(listing));
      console.log("Listing saved to AsyncStorage");
    } catch (error) {
      console.error("Failed to save listing to AsyncStorage", error);
    }
  };

  // Handle form submission anf save listing to Firebase Realtime Database
  const handleSubmit = async () => {
    if (title && description && size && price && address && zipcode && city) {
      const db = getDatabase();
      const listingsRef = ref(db, 'listings');
      const newListingRef = push(listingsRef);
      const listing = {
        title,
        description,
        size,
        price,
        deposit,
        address,
        zipcode,
        city,
        images,
        createdAt: new Date().toISOString(), 
      };
      await set(newListingRef, listing);
      await saveToLocalStorage(listing);
      navigation.navigate('Listings');
    } else {
      alert("Please fill out all fields");
    }
  };

  // Pick image to allow adding photos from camera or library
  const pickImage = async () => {
    Alert.alert(
      "Add a photo",
      "Choose an option:",
      [
        {
          text: "Take photo",
          onPress: async () => {
            try {
              let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });
              if (!result.canceled) {
                const newImageUri = result.assets ? result.assets[0].uri : result.uri;
                setImages([...images, newImageUri]);
              }
            } catch (e) {
              console.error("Error taking photo: ", e);
            }
          },
        },
        {
          text: "Choose from library",
          onPress: async () => {
            try {
              let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                aspect: [4, 3],
                quality: 1,
                allowsMultipleSelection: true,
              });
              if (!result.canceled) {
                const newUris = result.assets.map(asset => asset.uri);
                setImages([...images, ...newUris]);
                console.log("Images from library: ", newUris);
              }
            } catch (e) {
              console.error("Error choosing from library: ", e);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

 
  // Render image in FlatList with delete button so user can view and delete uploaded images before submitting
  const renderImage = ({ item, index }) => (
    <View style={styles.imageContainer}>
      <TouchableOpacity onPress={() => setSelectedImage(item)}>
        <Image source={{ uri: item }} style={styles.image} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteImage(index)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  // Delete image from images array 
  const deleteImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };


  return (
    // Input fields with KeyboardAvoidingView used to make sure the keyboard does not cover the input fields
    <KeyboardAvoidingView
      style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Roomies</Text>
        </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <View style={styles.container}>
          <Text style={styles.heading}>Create Listing</Text>
          <TextInput
            placeholder="Pick a fitting title!"
            style={styles.input}
            value={title}
            onChangeText={(text) => setTitle(text)}
          />
          <TextInput
            placeholder="Describe your room or apartment."
            style={styles.input}
            value={description}
            onChangeText={(text) => setDescription(text)}
            multiline
          />
          <TextInput
            placeholder="Size in m²"
            style={styles.input}
            value={size}
            keyboardType="numeric"
            onChangeText={(text) => {
              // Remove any "m²" from the input to avoid adding it multiple times
              const cleanedText = text.replace(" m²", "");
              setSize(cleanedText);
            }}
            onBlur={() => {
              // Add "m²" only if there's a number in the field
              if (size && !isNaN(size) && size.trim() !== "") {
                setSize(size + " m²");
              } else {
                setSize(""); // Keep it empty if there's no valid number
              }
            }}
          />

          <TextInput
            placeholder="Monthly rent in DKK"
            style={styles.input}
            value={price}
            keyboardType="numeric"
            onChangeText={(text) => {
              const cleanedText = text.replace(",-", "");
              setPrice(cleanedText);
            }}
            onBlur={() => {
              if (price && !isNaN(price) && price.trim() !== "") {
                setPrice(price + ",-");
              } else {
                setPrice(""); 
            }
          }}  
          />
          <TextInput
            placeholder="Deposit in DKK"
            style={styles.input}
            value={deposit}
            keyboardType="numeric"
            onChangeText={(text) => {
              const cleanedText = text.replace(",-", "");
              setDeposit(cleanedText);
            }}
            onBlur={() => {
              if (deposit && !isNaN(deposit) && deposit.trim() !== "") {
                setDeposit(deposit + ",-");
              } else {
                setDeposit("");
              }
            }}
          />
          <TextInput
            placeholder="Address"
            style={styles.input}
            value={address}
            onChangeText={(text) => setAddress(text)}
          />
          <TextInput
            placeholder="Zipcode"
            style={styles.input}
            value={zipcode}
            onChangeText={(text) => setZipcode(text)}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="City"
            style={styles.input}
            value={city}
            onChangeText={(text) => setCity(text)}
          />


          <TouchableOpacity onPress={pickImage} style={styles.button}>
            <Text style={styles.buttonText}>Add photos</Text>
          </TouchableOpacity>
          {images.length > 0 && (
            <FlatList
              data={images}
              renderItem={renderImage}
              keyExtractor={(item, index) => index.toString()}
              horizontal
            />
          )}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
          
    
        <Modal visible={selectedImage !== null} transparent={true}>
          <View style={styles.modalContainer}> 
            <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.fullSizeImage} />
            )}
          </View>
        </Modal>
      
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#4A56A2",
    paddingTop: 60,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    
  },
  headerText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    backgroundColor: "transparent",
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#4A56A2",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f5",
    borderColor: "#C2C8E5",
  },
  button: {
    backgroundColor: "#4A56A2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#4A56A2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 50,
  },

  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 15,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: -5,
    backgroundColor: '#4A56A2',
    opacity: 0.85,
    borderRadius: 15,
    padding: 5,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  moreImages: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A56A2',
    opacity: 0.8,
    borderRadius: 8,
    marginTop: 15,
  },
  moreImagesText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 10,
  },
  closeButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
  },
  fullSizeImage: {
    width: "90%",
    height: "70%",
    borderRadius: 8,
  },
});


export default CreateListing;
