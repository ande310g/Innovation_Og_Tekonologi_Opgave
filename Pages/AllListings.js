import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, StyleSheet, Image } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { globalStyles } from './Styles';

const ListingsPage = ({ navigation }) => {
  // State til at holde lejemålene, indlæsningsstatus og nuværende side
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6; // Antal elementer per side

  useEffect(() => {
    const fetchListings = async () => {
      const db = getDatabase(); // Initialiserer Firebase Realtime Database
      const listingsRef = ref(db, 'listings'); // Reference til 'listings' i databasen

      // Lytter til ændringer i 'listings' data
      onValue(listingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val(); // Henter data som objekt
          const allListings = Object.entries(data).flatMap(([userId, userListings]) =>
              Object.entries(userListings).map(([id, value]) => ({
                id,
                userId,
                ...value, // Kombinerer listingens data med id og userId
              }))
          );
          setListings(allListings); // Gemmer alle listings i state
        } else {
          setListings([]); // Hvis ingen data, sætter listen til tom
        }
        setLoading(false); // Slår loading fra
      });
    };

    fetchListings(); // Kalder funktionen ved komponentens load
  }, []);

  // Beregner hvilke listings der skal vises på den nuværende side
  const paginatedListings = listings.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (page * ITEMS_PER_PAGE < listings.length) {
      setPage(page + 1); // Går til næste side
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1); // Går til forrige side
    }
  };

  // Funktion til at rendere en enkelt listing
  const renderListing = ({ item }) => (
      <TouchableOpacity
          style={globalStyles.listItem}
          onPress={() => navigation.navigate('DetailedListing', { listingId: item.id })} // Navigerer til detaljeret visning
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

  // Viser en loading-indikator indtil data er hentet
  if (loading) {
    return (
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
    );
  }

  // Returnerer UI til at vise lejemålene
  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <View style={globalStyles.container}>
          {/* Top-sektion med tilbage-knap og logo */}
          <View style={globalStyles.backAndLogoContainer}>
            <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
              <Text style={globalStyles.backButton}> ← Tilbage</Text>
            </TouchableOpacity>
            <Image source={require('../assets/Logo.jpg')} style={{ width: 110, height: 60 }} />
          </View>
          <Text style={globalStyles.title}>Alle Lejemål</Text>

          {/* Tjekker om der er nogle listings */}
          {listings.length > 0 ? (
              <>
                {/* FlatList til at vise listings på nuværende side */}
                <FlatList
                    data={paginatedListings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderListing}
                />
                {/* Pagination sektion */}
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
