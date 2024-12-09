import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, ScrollView, SafeAreaView, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { globalStyles } from './Styles';

const MyListing = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const userListingRef = ref(db, `listings/${user.uid}`);

        // Fetch user's listings
        onValue(userListingRef, (snapshot) => {
          setLoading(false);
          if (snapshot.exists()) {
            const data = snapshot.val();
            const listingsArray = Object.entries(data).map(([id, value]) => ({
              id,
              ...value,
            }));
            setListings(listingsArray);
          } else {
            setListings([]);
          }
        });
      } else {
        Alert.alert("Error", "User not logged in");
        navigation.navigate("Login");
      }
    };

    fetchListings();
  }, [navigation]);

  const handleDelete = (listingId) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const listingRef = ref(db, `listings/${user.uid}/${listingId}`);

      // Confirm deletion
      Alert.alert(
        "Slet lejemål",
        "Er du sikker?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await remove(listingRef);
                setListings((prevListings) =>
                  prevListings.filter((listing) => listing.id !== listingId)
                );
                Alert.alert("Success", "Lejemål slettet");
              } catch (error) {
                Alert.alert("Error", "Kunne ikke slette lejemålet");
              }
            },
          },
        ]
      );
    }
  };

  const handleEdit = (listingId) => {
    navigation.navigate('EditListing', { listingId });
    };

    const renderListing = ({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate('DetailedListing', { listingId: item.id })}
          activeOpacity={0.8}
        >
          <Text style={styles.listTitle}>{item.title}</Text>
          <Text style={styles.listDescription}>{item.description}</Text>
          <Text style={styles.listDetails}>{`Størrelse: ${item.size} m2`}</Text>
          <Text style={styles.listDetails}>{`Pris: $${item.price} ,-`}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleEdit(item.id)}
            >
              <Text style={styles.deleteButtonText}>Rediger</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteButtonText}>Slet</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );


  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return listings.length > 0 ? (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <View style={globalStyles.container}>
    <View style = {globalStyles.backAndLogoContainer}>
    <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
        <Text style={globalStyles.backButton}> ← Tilbage</Text>
    </TouchableOpacity>
    <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
    </View>
    
      <Text style={globalStyles.title}>Mit Lejemål</Text>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderListing}
      />
    </View>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
    <View style={globalStyles.container}>
        <View style = {globalStyles.backAndLogoContainer}>
        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
            <Text style={globalStyles.backButton}> ← Tilbage</Text>
        </TouchableOpacity>
        <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
        </View>
      <Text style={globalStyles.title}>Du har endnu ikke oprettet en annonce for dit lejemål.</Text>
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('CreateListing')}
      >
        <Text style={globalStyles.buttonText}>Opret lejemål</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listDescription: {
    fontSize: 14,
    color: '#555',
  },
  listDetails: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ff4d4f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MyListing;