import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  const [profileName, setProfileName] = useState("");

  // Hent brugernavn fra AsyncStorage
  const getProfileData = async () => {
    try {
      const userData = await AsyncStorage.getItem("@user_data");
      if (userData !== null) {
        const parsedData = JSON.parse(userData);
        setProfileName(parsedData.username); // Brug brugernavnet fra gemte data
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
    }
  };

  useEffect(() => {
    getProfileData(); // Hent data når komponenten loader
  }, []);

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <Image source={require("../imgs/nikoline.jpg")} style={styles.image} />

      {/* Profile Name */}
      <Text style={styles.name}>{profileName ? profileName : "Bruger"}</Text>

      {/* Profile Text */}
      <Text>
        Mit navn er {profileName}. Jeg er 25 år gammel og søger bolig i
        København. Skriv til mig, hvis vi kunne være et match!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
