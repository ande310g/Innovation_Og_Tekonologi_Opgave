import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert } from "react-native";
import { getDatabase, ref, get, update, set } from "firebase/database";
import * as ImagePicker from 'expo-image-picker';

//
const EditListing = ({ route, navigation }) => { 
  const { listingId } = route.params; 
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [address, setAddress] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState([]);

  // Fetch the listing details from Firebase 
  useEffect(() => {
    const fetchListingDetails = async () => {
      const db = getDatabase();
      const listingRef = ref(db, `listings/${listingId}`);
      const snapshot = await get(listingRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setListing(data);
        setTitle(data.title);
        setDescription(data.description);
        setSize(data.size);
        setPrice(data.price);
        setDeposit(data.deposit);
        setAddress(data.address);
        setZipcode(data.zipcode);
        setCity(data.city);
        setImages(data.images || []);
      }
      setLoading(false);
    };
    fetchListingDetails();
  }, [listingId]);

// Update the listing in Firebase
  const handleUpdate = async () => { 
    const db = getDatabase();
    const listingRef = ref(db, `listings/${listingId}`);
    await update(listingRef, {
      title,
      description,
      size,
      price,
      deposit,
      address,
      zipcode,
      city,
      images,
    });
    navigation.goBack();
  };

  // Delete the listing from Firebase
  const handleDelete = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this listing?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const db = getDatabase();
            const listingRef = ref(db, `listings/${listingId}`);
            await set(listingRef, null); // Use set to delete the listing
            navigation.navigate('Listings'); // Navigate back to Listings after deletion
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };
  
  
  // Function to pick an image from the camera or gallery and add to the listing
  const pickImage = async () => {
    Alert.alert(
      "Add a photo",
      "Choose an option:",
      [
        {
          text: "Take photo",
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled) {
              setImages([...images, result.assets[0].uri]);
            }
          },
        },
        {
          text: "Choose from library",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              aspect: [4, 3],
              quality: 1,
              allowsMultipleSelection: true,
            });
            if (!result.canceled) {
              const newUris = result.assets.map(asset => asset.uri);
              setImages([...images, ...newUris]);
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

  const deleteImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust keyboard behavior based on platform
    >
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Roomies</Text>
        </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TextInput
            placeholder="Title"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            placeholder="Description"
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            placeholder="Size"
            style={styles.input}
            value={size}
            keyboardType="numeric"
            onChangeText={(text) => {
              const cleanedText = text.replace(" m²", "");
              setSize(cleanedText);
            }}
            onBlur={() => {
              if (size && !isNaN(size) && size.trim() !== "") {
                setSize(size + " m²");
              } else {
                setSize("");
              }
            }}
          />
          <TextInput
            placeholder="Monthly Rent"
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
            placeholder="Deposit"
            style={styles.input}
            value={deposit}
            keyboardType="numeric"
            onChangeText={(text) => { 
              const cleanedText = text.replace(",-", "");
              setDeposit(cleanedText);
            }}
            onBlur={() => { // Add ,- to the end of the deposit amount if it's a valid number and not empty
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
            onChangeText={setAddress}
          />
          <TextInput
            placeholder="Zipcode"
            style={styles.input}
            value={zipcode}
            onChangeText={setZipcode}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="City"
            style={styles.input}
            value={city}
            onChangeText={setCity}
          />
          <TouchableOpacity onPress={pickImage} style={styles.button}>
            <Text style={styles.buttonText}>Add photos</Text>
          </TouchableOpacity>
          {images.length > 0 && (
            <ScrollView horizontal contentContainerStyle={styles.photosContainer}>
                            {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity onPress={() => deleteImage(index)} style={styles.deleteButton}> 
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
            <Text style={styles.submitButtonText}>Update Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteListingButton} onPress={handleDelete}>
            <Text style={styles.deleteListingButtonText}>Delete Listing</Text>
          </TouchableOpacity>


        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: "#4A56A2",
    paddingTop: 55,
    paddingBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 55,
    backgroundColor: "transparent",
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 24,
  },
  headerText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 110, 
    backgroundColor: "#FFF",
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
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  photosContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    borderRadius: 15,
    padding: 5,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  deleteListingButton: {
    backgroundColor: "#FF3B30", 
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  deleteListingButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditListing;
