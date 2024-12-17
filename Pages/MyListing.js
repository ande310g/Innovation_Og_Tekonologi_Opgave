import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Image, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { globalStyles } from './Styles';

// Komponent til at vise og administrere brugerens lejemålsannoncer
const MyListing = ({ navigation }) => {
  const [listings, setListings] = useState([]); // State til at holde lejemålsannoncer
  const [loading, setLoading] = useState(true); // State til at håndtere indlæsningsstatus

  // Henter brugerens annoncer ved komponentens rendering
  useEffect(() => {
    const fetchListings = async () => {
      const auth = getAuth(); // Henter den nuværende bruger
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase(); // Initialiserer databasen
        const userListingRef = ref(db, `listings/${user.uid}`); // Reference til brugerens annoncer

        // Lytter til ændringer i brugerens annoncer
        onValue(userListingRef, (snapshot) => {
          setLoading(false);
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Konverterer objekt til en array af annoncer
            const listingsArray = Object.entries(data).map(([id, value]) => ({
              id,
              ...value,
            }));
            setListings(listingsArray);
          } else {
            setListings([]); // Tøm listen, hvis ingen annoncer findes
          }
        });
      } else {
        Alert.alert("Fejl", "Bruger ikke logget ind");
        navigation.navigate("Login"); // Navigerer til login-skærmen
      }
    };

    fetchListings();
  }, [navigation]);

  // Funktion til at slette et lejemål
  const handleDelete = (listingId) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const listingRef = ref(db, `listings/${user.uid}/${listingId}`); // Reference til det specifikke lejemål

      // Bekræftelsesdialog før sletning
      Alert.alert(
          "Slet lejemål",
          "Er du sikker?",
          [
            { text: "Annuller", style: "cancel" }, // Luk dialogen uden handling
            {
              text: "Slet",
              style: "destructive",
              onPress: async () => {
                try {
                  await remove(listingRef); // Sletter lejemålet fra databasen
                  // Opdaterer UI ved at fjerne annoncen fra state
                  setListings((prevListings) =>
                      prevListings.filter((listing) => listing.id !== listingId)
                  );
                  Alert.alert("Succes", "Lejemål slettet");
                } catch (error) {
                  Alert.alert("Fejl", "Kunne ikke slette lejemålet");
                }
              },
            },
          ]
      );
    }
  };

  // Funktion til at redigere et lejemål
  const handleEdit = (listingId) => {
    navigation.navigate('EditListing', { listingId }); // Navigerer til redigeringsskærmen med det specifikke ID
  };

  // Funktion til at vise hver enkelt annonce
  const renderListing = ({ item }) => (
      <TouchableOpacity
          style={styles.listItem}
          onPress={() =>
              navigation.navigate('DetailedListing', {
                listingId: item.id,
                userId: getAuth().currentUser.uid,
              })
          }
          activeOpacity={0.8}
      >
        {/* Thumbnail billede */}
        {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />
        ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={{ color: '#ccc', fontSize: 12 }}>Ingen billede</Text>
            </View>
        )}

        {/* Lejemålsdetaljer */}
        <View style={styles.listContent}>
          <Text style={globalStyles.listTitle}>{item.title}</Text>
          <Text style={globalStyles.listDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={globalStyles.listDetails}>{`Størrelse: ${item.size} m²`}</Text>
          <Text style={globalStyles.listDetails}>{`Pris: ${item.price} ,-`}</Text>

          {/* Knapper til redigering og sletning */}
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
                style={[globalStyles.button, { height: 40, width: 80, marginRight: 10 }]}
                onPress={() => handleEdit(item.id)}
            >
              <Text style={globalStyles.buttonText}>Rediger</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[globalStyles.button, { height: 40, width: 80 }]}
                onPress={() => handleDelete(item.id)}
            >
              <Text style={globalStyles.buttonText}>Slet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
  );

  // Viser en indlæsningsindikator, mens data hentes
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
          {/* Header med tilbage-knap og logo */}
          <View style={globalStyles.backAndLogoContainer}>
            <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.navigate('MyProfile')}>
              <Text style={globalStyles.backButton}> ← Tilbage</Text>
            </TouchableOpacity>
            <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
          </View>

          {/* Titel */}
          <Text style={globalStyles.title}>Mit Lejemål</Text>

          {/* Viser listen af annoncer */}
          {listings.length > 0 ? (
              <FlatList
                  data={listings}
                  keyExtractor={(item) => item.id}
                  renderItem={renderListing}
              />
          ) : (
              <Text style={globalStyles.title}>Du har endnu ikke oprettet en annonce for dit lejemål.</Text>
          )}

          {/* Knappen til at oprette en ny annonce */}
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

// Lokale stilarter til komponenten
const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 2,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default MyListing;
