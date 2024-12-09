import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { globalStyles } from './Styles';

const DetailedListing = ({ route, navigation }) => {
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
        <Text style={globalStyles.title}>No Listing Found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#ffffff"}}>
    <View style={globalStyles.container}>    
        <View style={globalStyles.backAndLogoContainer}>
            <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                <Text style={globalStyles.backButton}> ← Tilbage</Text>
            </TouchableOpacity>
            <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
        </View>
      <Text style={globalStyles.title}>{listing.title}</Text>
      <Text style={styles.detailText}>Description: {listing.description}</Text>
      <Text style={styles.detailText}>Size: {listing.size} m2</Text>
      <Text style={styles.detailText}>Price: ${listing.price} ,-</Text>
      <Text style={styles.detailText}>Deposit: ${listing.deposit} ,-</Text>
      <Text style={styles.detailText}>Address: {listing.address}</Text>
      <Text style={styles.detailText}>Zip Code: {listing.zipcode}</Text>
      <Text style={styles.detailText}>City: {listing.city}</Text>
      <Text style={styles.detailText}>
        Created At: {new Date(listing.createdAt).toLocaleDateString()}
      </Text>
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
});

export default DetailedListing;