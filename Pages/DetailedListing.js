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

const DetailedListing = ({ route, navigation }) => {
  const { listingId, userId } = route.params; // Get userId and listingId from navigation params
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      const db = getDatabase();
      const listingRef = ref(db, `listings/${userId}/${listingId}`); // Use userId to fetch correct path

      try {
        const snapshot = await get(listingRef);
        if (snapshot.exists()) {
          setListing(snapshot.val());
        } else {
          Alert.alert("Fejl", "Kunne ikke finde lejemålet");
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert("Fejl", "Kunne ikke hente annoncedetaljer");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, userId, navigation]);

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Ingen lejemålsannonce fundet</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={globalStyles.container}>    
        {/* Header */}
        <View style={globalStyles.backAndLogoContainer}>
          <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
            <Text style={globalStyles.backButton}> ← Tilbage</Text>
          </TouchableOpacity>
          <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
        </View>

        {/* Listing Details */}
        <Text style={globalStyles.title}>{listing.title}</Text>
        <Text style={styles.detailText}>Beskrivelse: {listing.description}</Text>
        <Text style={styles.detailText}>Strørrelse: {listing.size} m²</Text>
        <Text style={styles.detailText}>Månedlig husleje: ${listing.price} ,-</Text>
        <Text style={styles.detailText}>Depositum: ${listing.deposit} ,-</Text>
        <Text style={styles.detailText}>Adresse: {listing.address}</Text>
        <Text style={styles.detailText}>Post nummer: {listing.zipcode}</Text>
        <Text style={styles.detailText}>By: {listing.city}</Text>
        <Text style={styles.detailText}>
          Oprettet: {new Date(listing.createdAt).toLocaleDateString()}
        </Text>

        {/* Image Gallery */}
        {listing.images && listing.images.length > 0 && (
          <>
            <Text style={globalStyles.label}>Billeder</Text>
            <FlatList
              data={listing.images}
              keyExtractor={(item, index) => `${item}_${index}`}
              renderItem={({ item }) => (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item }} style={styles.image} />
                </View>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  detailText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
  imageContainer: {
    marginVertical: 10,
    marginRight: 10,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
});

export default DetailedListing;