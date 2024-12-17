import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, StyleSheet, Image } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { globalStyles } from './Styles';

const ListingsPage = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchListings = async () => {
      const db = getDatabase();
      const listingsRef = ref(db, 'listings');

      onValue(listingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const allListings = Object.entries(data).flatMap(([userId, userListings]) =>
            Object.entries(userListings).map(([id, value]) => ({
              id,
              userId,
              ...value,
            }))
          );
          setListings(allListings);
        } else {
          setListings([]);
        }
        setLoading(false);
      });
    };

    fetchListings();
  }, []);

  const paginatedListings = listings.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (page * ITEMS_PER_PAGE < listings.length) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
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
      {/*denne skal ændres til at vise brugerens navn*/}
      <Text style={globalStyles.listDetails}>{'Lavet af: ' + item.userId}</Text>
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
        <Text style={globalStyles.title}>Alle Lejemål</Text>
        
        {listings.length > 0 ? (
          <>
            <FlatList
              data={paginatedListings}
              keyExtractor={(item) => item.id}
              renderItem={renderListing}
            />
            <View style={globalStyles.pagination}>
              <TouchableOpacity
                style={[globalStyles.paginationButton, page === 1 && globalStyles.disabledButton]}
                onPress={handlePrevPage}
                disabled={page === 1}
              >
                <Text style={globalStyles.paginationText}>Forrige</Text>
              </TouchableOpacity>
              <Text style={globalStyles.pageIndicator}>{`${page}/${Math.ceil(listings.length / ITEMS_PER_PAGE)}`}</Text>
              <TouchableOpacity
                style={[globalStyles.paginationButton, page * ITEMS_PER_PAGE >= listings.length && globalStyles.disabledButton]}
                onPress={handleNextPage}
                disabled={page * ITEMS_PER_PAGE >= listings.length}
              >
                <Text style={globalStyles.paginationText}>Næste</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={globalStyles.title}>Ingen lejemål fundet.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};



export default ListingsPage;
