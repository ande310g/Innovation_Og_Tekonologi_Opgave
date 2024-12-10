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
          style={globalStyles.listItem}
          onPress={() => navigation.navigate('DetailedListing', { listingId: item.id })}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.listTitle}>{item.title}</Text>
          <Text style={globalStyles.listDescription}>{item.description}</Text>
          <Text style={globalStyles.listDetails}>{`Størrelse: ${item.size} m2`}</Text>
          <Text style={globalStyles.listDetails}>{`Pris: $${item.price} ,-`}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity
              style={[globalStyles.button, {height: 40, width: 80}]}
              onPress={() => handleEdit(item.id)}
            >
              <Text style={globalStyles.buttonText}>Rediger</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.button, {height: 40, width: 80}]}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={globalStyles.buttonText}>Slet</Text>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={globalStyles.container}>
        <View style={globalStyles.backAndLogoContainer}>
          <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
            <Text style={globalStyles.backButton}> ← Tilbage</Text>
          </TouchableOpacity>
          <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
        </View>
        <Text style={globalStyles.title}>Mit Lejemål</Text>
        
        {listings.length > 0 ? (
          <>
            <FlatList
              data={listings}
              keyExtractor={(item) => item.id}
              renderItem={renderListing}
            />
          </>
        ) : (
          <Text style={globalStyles.title}>
            Du har endnu ikke oprettet en annonce for dit lejemål.
          </Text>
        )}
  
        {/* Add New Listing Button */}
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Text style={globalStyles.buttonText}>Opret nyt lejemål</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
  
};




export default MyListing;