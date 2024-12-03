import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from '@react-navigation/native';

// List all listings
const Listings = () => {
  const [listings, setListings] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const listingsRef = ref(db, "listings");

    onValue(listingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listingsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();
        setListings(listingsArray);
      } else {
        setListings([]);
      }
    });
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ListingDetails', { listingId: item.id })}
    >
      <View style={styles.listingItem}>
        {item.images && item.images.length > 0 && (
          <Image source={{ uri: item.images[0] }} style={styles.listingImage} />
        )}
        <View style={styles.listingDetails}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.size}>{item.size} </Text>
          <Text>{item.address}</Text>
          <Text>{item.zipcode} {item.city}</Text>
          <Text>Monthly Rent: {item.price}</Text>
          <Text>Deposit: {item.deposit}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
 
//Create additional pages if there are more than 5 listings
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

const totalPages = Math.ceil(listings.length / itemsPerPage);

const handlePreviousPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};

const handleNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};

const paginate = (listings) => {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return listings.slice(start, end);
};


return (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerText}>Roomies</Text>
    </View>
    <FlatList
      data={paginate(listings)}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => <Text style={styles.heading}>Listings</Text>}
      contentContainerStyle={{ paddingTop: 110 }}
    />
    <View style={styles.pagination}>
      <TouchableOpacity onPress={handlePreviousPage} disabled={currentPage === 1}>
        <Text style={styles.pageButton}>{'        <        '}</Text>
      </TouchableOpacity>
      <Text style={styles.pageNumber}>Page {currentPage} of {totalPages}</Text>
      <TouchableOpacity onPress={handleNextPage} disabled={currentPage === totalPages}>
        <Text style={styles.pageButton}>{'        >        '}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
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
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A56A2",
    marginLeft: 10,
    marginTop: 20,
  },
  listingItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    borderColor: "#C2C8E5",
    borderWidth: 2,
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  listingImage: {
    width: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  listingDetails: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: "#4A56A2",
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#4A4A4A",
  },
  size: {
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 5,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#4A56A2',
    borderTopWidth: 1,
    borderColor: "#C2C8E5",
  },
  pageButton: {
    fontSize: 24,
    marginBottom: 10,
    color: "#FFF",
  },
  pageNumber: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default Listings;
