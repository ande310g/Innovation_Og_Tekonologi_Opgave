import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // Funktion til at håndtere login
  const handleLogin = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("@user_data");
      if (storedUserData) {
        const { email: storedEmail, password: storedPassword } =
          JSON.parse(storedUserData);

        if (email === storedEmail && password === storedPassword) {
          setLoginMessage("Login succesfuldt!");
          navigation.navigate("Main"); // Navigér til Main (hovedfaner)
        } else {
          setLoginMessage("Forkert e-mail eller adgangskode.");
        }
      } else {
        setLoginMessage("Ingen bruger fundet. Opret en konto.");
      }
    } catch (error) {
      console.error("Login fejl:", error);
      setLoginMessage("Der opstod en fejl under login.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log ind</Text>

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

      <Button title="Log ind" onPress={handleLogin} />

      {loginMessage ? <Text style={styles.message}>{loginMessage}</Text> : null}

      <Text style={styles.signupPrompt}>
        Har du ikke en konto?{" "}
        <Text
          style={styles.signupLink}
          onPress={() => navigation.navigate("SignUp")}
        >
          Opret en bruger
        </Text>
      </Text>
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
  message: {
    textAlign: "center",
    color: "green",
    marginTop: 20,
  },
  signupPrompt: {
    marginTop: 20,
    textAlign: "center",
  },
  signupLink: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
