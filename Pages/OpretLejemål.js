import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, FlatList, Modal, SafeAreaView} from "react-native";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff"}}>
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        
        <View style={globalStyles.container}>
      <View style={globalStyles.backAndLogoContainer}>
        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
          <Text style={globalStyles.backButton}>← Tilbage</Text>
        </TouchableOpacity>
        <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    
      <Text style={globalStyles.title}>Opret lejemål</Text>
      <Text style={globalStyles.label}>Titel på lejeopslag</Text>
      <TextInput
        placeholder="Skriv en fangende titel!"
        value={title}
        onChangeText={setTitle}
        style={globalStyles.input}
      />
      <Text style={globalStyles.label}>Beskrivelse</Text>
      <TextInput
        placeholder="Beskriv dit lejemål"
        value={description}
        onChangeText={setDescription}
        style={globalStyles.input}
      />
      <Text style={globalStyles.label}>Størrelse</Text>
      <TextInput
        placeholder="Størrelse i m2"
        value={size}
        onChangeText={setSize}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <Text style={globalStyles.label}>Husleje</Text>
      <TextInput
        placeholder="Månedlig husleje"
        value={price}
        onChangeText={setPrice}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <Text style={globalStyles.label}>Depositum</Text>
      <TextInput
        placeholder="Depositum"
        value={deposit}
        onChangeText={setDeposit}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <Text style={globalStyles.label}>Adresse</Text>
      <TextInput
        placeholder="Addresse på lejemålet"
        value={address}
        onChangeText={setAddress}
        style={globalStyles.input}
      />
      <Text style={globalStyles.label}>Postnummer</Text>
      <TextInput
        placeholder="Postnummer"
        value={zipcode}
        onChangeText={setZipcode}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <Text style={globalStyles.label}>By</Text>
      <TextInput
        placeholder="By"
        value={city}
        onChangeText={setCity}
        style={globalStyles.input}
      />
      <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
        <Text style={globalStyles.buttonText}>Submit</Text>
      </TouchableOpacity>
    
    
    </ScrollView >
    </View>
    
    
    </KeyboardAvoidingView>  
    </SafeAreaView>
    );
}

export default CreateListing;