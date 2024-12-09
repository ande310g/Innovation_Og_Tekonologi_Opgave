import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import { globalStyles } from './Styles';

const EditListing = ({ route, navigation }) => {
  const { listingId } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

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
            setListing(snapshot.val());
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

  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && listing) {
      const db = getDatabase();
      const listingRef = ref(db, `listings/${user.uid}/${listingId}`);

      try {
        await update(listingRef, listing);
        Alert.alert("Success", "Listing updated successfully");
        navigation.goBack();
      } catch (error) {
        Alert.alert("Error", "Failed to update listing");
      }
    }
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
      <Text style={globalStyles.title}>Edit Listing</Text>
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
        value={listing?.size || ''}
        onChangeText={(text) => setListing({ ...listing, size: text })}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <TextInput
        placeholder="Price"
        value={listing?.price || ''}
        onChangeText={(text) => setListing({ ...listing, price: text })}
        style={globalStyles.input}
        keyboardType="number-pad"
      />
      <TouchableOpacity style={globalStyles.button} onPress={handleSave}>
        <Text style={globalStyles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

export default EditListing;