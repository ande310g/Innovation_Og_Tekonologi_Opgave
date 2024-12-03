import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function MatchList({ navigation }) {
  // Definerer en state "matches" til at gemme listen af matches hentet fra Firebase-databasen
  const [matches, setMatches] = useState([]);

  // useEffect hook til at hente data fra Firebase-databasen når komponenten loader
  useEffect(() => {
    const db = getDatabase();
    const matchesRef = ref(db, "Matches");

    // Lytter til ændringer i databasen og opdaterer state, når der er nye matches
    onValue(matchesRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        setMatches(Object.entries(data)); // Gem matches som en liste af arrays
      }
    });
  }, []);

  // Funktion til at fjerne et match fra Firebase
  const handleDelete = id => {
    const db = getDatabase();
    const matchRef = ref(db, `Matches/${id}`);
    remove(matchRef).then(() => {
      // Efter sletning i databasen fjernes matchet også lokalt fra state, så listen opdateres
      setMatches(prevMatches => prevMatches.filter(match => match[0] !== id));
    });
  };

  return (
    // FlatList til at vise alle matches i en liste
    <FlatList
      data={matches}
      keyExtractor={item => item[0]}
      renderItem={({ item }) => (
        <View style={styles.matchItem}>
          <Image source={item[1].imageUrl} style={styles.image} />
          <Text style={styles.matchText}>{item[1].name}</Text>
          <TouchableOpacity onPress={() => handleDelete(item[0])}>
            <Text style={styles.deleteText}>Fjern match</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  matchItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchText: {
    fontSize: 18,
  },
  deleteText: {
    color: "red",
  },
});
