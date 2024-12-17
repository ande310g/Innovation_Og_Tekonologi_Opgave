import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Image, StyleSheet } from 'react-native';
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
      onPress={() => navigation.navigate('DetailedListing', { 
        listingId: item.id,
        userId: getAuth().currentUser.uid, 
       })}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Text style={{ color: '#ccc', fontSize: 12 }}>No Image</Text>
        </View>
      )}

      {/* Listing Details */}
      <View style={styles.listContent}>
        <Text style={globalStyles.listTitle}>{item.title}</Text>
        <Text style={globalStyles.listDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={globalStyles.listDetails}>{`Størrelse: ${item.size} m2`}</Text>
        <Text style={globalStyles.listDetails}>{`Pris: ${item.price} ,-`}</Text>
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
          <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            renderItem={renderListing}
          />
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