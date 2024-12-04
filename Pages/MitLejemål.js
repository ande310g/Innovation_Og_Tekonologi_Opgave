import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, FlatList, Modalr} from "react-native";
import { useState } from "react";
import { globalStyles } from "./Styles";
import * as ImagePicker from 'expo-image-picker';


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

  const handleSubmit = async () => {
    if (title && description && size && price && address && zipcode && city) {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const listingsRef = ref(db, `listings/${user.uid}`); // Include the user UID in the path
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
          userId: user.uid, // Store the user ID with the listing
        };

        await set(newListingRef, listing);
        await saveToLocalStorage(listing);
        navigation.navigate('Listings');
      } else {
        alert("User not logged in");
      }
    } else {
      alert("Please fill out all fields");
    }
  };



  return (
    <View style={globalStyles.container}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={globalStyles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={globalStyles.input}
      />
      <TextInput
        placeholder="Size"
        value={size}
        onChangeText={setSize}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <TextInput
        placeholder="Deposit"
        value={deposit}
        onChangeText={setDeposit}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <TextInput
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        style={globalStyles.input}
      />
      <TextInput
        placeholder="Zipcode"
        value={zipcode}
        onChangeText={setZipcode}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <TextInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
        style={globalStyles.input}
      />
      <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
        <Text style={globalStyles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
    );
}

export default CreateListing;