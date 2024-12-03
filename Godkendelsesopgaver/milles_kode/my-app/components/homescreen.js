import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import TinderCard from "react-tinder-card";
import { getDatabase, ref, push } from "firebase/database";
import Ionicons from "react-native-vector-icons/Ionicons";

// Hovedkomponent for HomeScreen
export default function Homescreen({ navigation }) {
  // Definerer tilstanden "people", der indeholder en liste af personer med navn, alder, billede og en kort beskrivelse.
  const [people, setPeople] = useState([
    {
      name: "Anna",
      age: 21,
      url: require("../imgs/anna.jpg"),
      description: "Loves hiking and coffee. Looking for a roommate.",
      location: { latitude: 55.6777, longitude: 12.5214 }, // Frederiksberg coordinates
    },
    {
      name: "Emma",
      age: 23,
      url: require("../imgs/emma.jpg"),
      description: "Enjoys painting and reading. Renting out a room.",
    },
    {
      name: "Sofie",
      age: 25,
      url: require("../imgs/sofie.jpg"),
      description:
        "Fan of travel and adventure. Searching for a roommate for my place in Frederiksberg",
    },
  ]);

  // Opretter en state til at holde styr på den sidste swipe-retning
  const [lastDirection, setLastDirection] = useState();

  // Funktion til håndtering af swipe-bevægelse, gemmer liked person til Firebase
  const swiped = (direction, person) => {
    if (direction === "right") {
      // Opret forbindelse til Firebase-databasen
      const db = getDatabase();
      const matchRef = ref(db, "Matches");
      push(matchRef, { name: person.name, imageUrl: person.url }); //Match tilføjes til database
      console.log(`You matched with ${person.name}`);
    }
    setLastDirection(direction);
  };

  // Funktion til at håndtere, når kortet forlader skærmen
  const outOfFrame = name => {
    // Opdaterer listen over personer ved at fjerne personen, der har forladt skærmen
    setPeople(prevPeople => prevPeople.filter(person => person.name !== name));
    console.log(name + " left the screen");
  };

  // Håndterer "like" knap
  const handleLike = () => {
    // Tjekker om der stadig er personer tilbage i listen
    if (people.length > 0) {
      swiped("right", people[0]);
      // Fjerner personen fra skærmen, da de er blevet liket
      outOfFrame(people[0].name);
    }
  };

  // Håndterer "dislike" knap
  const handleDislike = () => {
    if (people.length > 0) {
      swiped("left", people[0]);
      // Fjerner personen fra skærmen, da de er blevet disliked
      outOfFrame(people[0].name);
    }
  };

  return (
    // Wrapper container for kortet og swipe-funktionen
    <View style={styles.container}>
      {people.length > 0 ? (
        <TinderCard
          key={people[0].name}
          // onSwipe-funktionen kaldes, når brugeren swiper på kortet
          onSwipe={direction => swiped(direction, people[0])}
          onCardLeftScreen={() => outOfFrame(people[0].name)}
        >
          <View style={styles.cardContainer}>
            <Image source={people[0].url} style={styles.image} />
            <Text style={styles.name}>
              {people[0].name}, {people[0].age}
            </Text>
            <Text style={styles.description}>{people[0].description}</Text>
          </View>
        </TinderCard>
      ) : (
        <Text>No more profiles</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.circleButton} onPress={handleDislike}>
          <Ionicons name="close" size={40} color="#FF6347" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton} onPress={handleLike}>
          <Ionicons name="heart" size={40} color="#32CD32" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles for komponentens layout og design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
  cardContainer: {
    width: "90%",
    maxWidth: 350,
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 20,
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "60%",
    marginTop: 20,
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
});
