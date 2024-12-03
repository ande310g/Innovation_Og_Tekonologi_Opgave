import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useFocusEffect } from '@react-navigation/native'
import { getDatabase, ref, get } from "firebase/database";

const ListingDetails = ({ route, navigation }) => {
  const { listingId } = route.params; 
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // Fetch listing details from Firebase 
  useFocusEffect(
    React.useCallback(() => {
      const fetchListingDetails = async () => {
        const db = getDatabase();
        const listingRef = ref(db, `listings/${listingId}`);
        const snapshot = await get(listingRef);
        if (snapshot.exists()) {
          setListing(snapshot.val());
        }
        setLoading(false);
      };

      fetchListingDetails();

      return () => setLoading(true); 
    }, [listingId])
  );

  if (loading) { // Show loading screen if data from Firebase is not loaded yet
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  
  }

  const hasImages = listing.images && listing.images.length > 0;

  return (
    
    <View style={styles.container}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Roomies</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditListing', { listingId })} style={styles.editButton}>
          <Text style={styles.editButtonText}>✎</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 90 }}>
        {hasImages && (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: listing.images[0] }} style={styles.thumbnail} />
            <Text style={styles.title}>{listing.title}</Text>
          </View>
        )}
        {!hasImages && <Text style={styles.title}>{listing.title}</Text>}
        {hasImages && (
          <ScrollView horizontal contentContainerStyle={styles.photosContainer}>
            {listing.images.slice(1).map((photo, index) => (
              <TouchableOpacity key={index} onPress={() => setFullScreenImage(photo)}>
                <Image source={{ uri: photo }} style={styles.photo} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={styles.detailsContainer}>
          <Text style={styles.details}>{listing.description}</Text>
          <Text style={styles.detailItem}>Size: {listing.size}</Text>
          <Text style={styles.detailItem}>{listing.address}</Text>
          <Text style={styles.detailItem}>{listing.zipcode}</Text>
          <Text style={styles.detailItem}>{listing.city}</Text>
          <Text style={styles.detailRent}>Monthly Rent: {listing.price}</Text>
          <Text style={styles.detailItem}>Deposit: {listing.deposit} </Text>
        </View>
      </ScrollView>
      
      <Modal visible={fullScreenImage !== null} transparent={true}> 
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setFullScreenImage(null)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          {fullScreenImage && (
            <Image source={{ uri: fullScreenImage }} style={styles.fullSizeImage} />
          )}
        </View>
      </Modal>
     </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
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
  editButton: {
    position: 'absolute',
    right: 20,
    top: 55,
    backgroundColor: "transparent",
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 400,
  },
  title: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 5,
  },
  photo: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
  },
  detailsContainer: {
    padding: 20,
  },
  details: {
    fontSize: 16,
    color: "#4A4A4A",
    marginBottom: 10,
  },
  detailItem: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  detailRent: {
    fontSize: 16,
    color: "#4A4A4A",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 10,
  },
  closeButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
  },
  fullSizeImage: {
    width: "90%",
    height: "70%",
    borderRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 50,
    backgroundColor: "#4A56A2",
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
});

export default ListingDetails;