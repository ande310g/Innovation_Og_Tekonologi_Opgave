import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList
} from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { globalStyles } from './Styles';

// Komponent til at vise detaljer om et specifikt lejemål
const DetailedListing = ({ route, navigation }) => {
  const { listingId, userId } = route.params; // Modtager `listingId` og `userId` fra navigationens parametre
  const [listing, setListing] = useState(null); // State til at gemme lejemålsdata
  const [loading, setLoading] = useState(true); // State til at håndtere indlæsningstilstand

  // Henter lejemålsdetaljer fra Firebase ved første rendering
  useEffect(() => {
    const fetchListing = async () => {
      const db = getDatabase(); // Initialiserer Firebase-databasen
      const listingRef = ref(db, `listings/${userId}/${listingId}`); // Sti til det specifikke lejemål i databasen

      try {
        const snapshot = await get(listingRef); // Henter data fra databasen
        if (snapshot.exists()) {
          setListing(snapshot.val()); // Gemmer lejemålsdata i state
        } else {
          Alert.alert("Fejl", "Kunne ikke finde lejemålet"); // Fejlbesked hvis data ikke findes
          navigation.goBack(); // Går tilbage til forrige skærm
        }
      } catch (error) {
        Alert.alert("Fejl", "Kunne ikke hente annoncedetaljer"); // Fejlbesked ved problemer med databaseforespørgsel
      } finally {
        setLoading(false); // Stopper indlæsningstilstanden
      }
    };

    fetchListing();
  }, [listingId, userId, navigation]); // Kører hver gang `listingId` eller `userId` ændres

  // Viser en indlæsningsindikator, mens data hentes
  if (loading) {
    return (
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
    );
  }

  // Viser en besked, hvis der ikke findes nogen data
  if (!listing) {
    return (
        <View style={globalStyles.container}>
          <Text style={globalStyles.title}>Ingen lejemålsannonce fundet</Text>
        </View>
    );
  }

  // Returnerer UI til visning af lejemålsdetaljer
  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <View style={globalStyles.container}>

          <View style={globalStyles.backAndLogoContainer}>
            <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
              <Text style={globalStyles.backButton}> ← Tilbage</Text>
            </TouchableOpacity>
            <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
          </View>


          <Text style={globalStyles.title}>{listing.title}</Text>
          <Text style={styles.detailText}>Beskrivelse: {listing.description}</Text>
          <Text style={styles.detailText}>Størrelse: {listing.size} m²</Text>
          <Text style={styles.detailText}>Månedlig husleje: ${listing.price} ,-</Text>
          <Text style={styles.detailText}>Depositum: ${listing.deposit} ,-</Text>
          <Text style={styles.detailText}>Adresse: {listing.address}</Text>
          <Text style={styles.detailText}>Post nummer: {listing.zipcode}</Text>
          <Text style={styles.detailText}>By: {listing.city}</Text>
          <Text style={styles.detailText}>
            Oprettet: {new Date(listing.createdAt).toLocaleDateString()}
          </Text>


          {listing.images && listing.images.length > 0 && (
              <>
                <Text style={globalStyles.label}>Billeder</Text>
                <FlatList
                    data={listing.images} // Liste af billed-URL'er
                    keyExtractor={(item, index) => `${item}_${index}`} // Unik nøgle for hvert billede
                    renderItem={({ item }) => (
                        <View style={styles.imageContainer}>
                          <Image source={{ uri: item }} style={styles.image} />
                        </View>
                    )}
                    horizontal // Viser billeder i en vandret scroll
                    showsHorizontalScrollIndicator={false} // Skjuler scroll-indikator
                />
              </>
          )}
        </View>
      </SafeAreaView>
  );
};

// Lokale stilarter til komponenten
const styles = StyleSheet.create({
  detailText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333', // Tekstfarve
  },
  imageContainer: {
    marginVertical: 10,
    marginRight: 10, // Afstand mellem billeder
  },
  image: {
    width: 200, // Billedets bredde
    height: 150, // Billedets højde
    borderRadius: 10, // Runde hjørner
  },
});

export default DetailedListing;
