import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapScreen() {
  const [people] = useState([
    {
      name: "Anna",
      age: 21,
      url: require("../imgs/anna.jpg"),
      description: "Loves hiking and coffee.",
      location: { latitude: 55.6777, longitude: 12.5214 }, // Frederiksberg
    },
    {
      name: "Emma",
      age: 23,
      url: require("../imgs/emma.jpg"),
      description: "Enjoys painting and reading.",
      location: { latitude: 55.6761, longitude: 12.5683 }, // Copenhagen
    },
    {
      name: "Sofie",
      age: 25,
      url: require("../imgs/sofie.jpg"),
      description:
        "Fan of travel and adventure. Searching for a roommate for my place in Frederiksberg",
      location: { latitude: 55.704, longitude: 12.5769 },
    },
  ]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 55.6761,
          longitude: 12.5683,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {people.map((person, index) => (
          <Marker key={index} coordinate={person.location} title={person.name}>
            {/* Custom marker with round profile image */}
            <Image source={person.url} style={styles.profileImage} />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
