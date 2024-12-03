// SignUpScreen.js
import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  // Funktion til at gemme brugerdata i AsyncStorage
  const handleSignUp = async () => {
    if (username && email && password) {
      const userData = { username, email, password };
      try {
        await AsyncStorage.setItem("@user_data", JSON.stringify(userData)); // Gem data i AsyncStorage
        setConfirmationMessage("Bruger oprettet!");
        console.log("User data stored:", userData);
        navigation.navigate("Home"); // Navigér til Home skærm efter succes
      } catch (error) {
        console.error("Failed to save the user data:", error);
      }
    } else {
      setConfirmationMessage("Udfyld venligst alle felter.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opret Bruger</Text>

      <TextInput
        style={styles.input}
        placeholder="Brugernavn"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Adgangskode"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Opret Bruger" onPress={handleSignUp} />

      {confirmationMessage ? (
        <Text style={styles.confirmation}>{confirmationMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  confirmation: {
    marginTop: 20,
    textAlign: "center",
    color: "green",
  },
});
