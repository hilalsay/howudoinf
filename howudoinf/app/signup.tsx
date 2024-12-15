import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Link } from "expo-router";

export default function Signup() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !lastname || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://10.0.2.2:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          lastname,
          email,
          password,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Registration successful!");
      } else {
        Alert.alert("Error", "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Sign Up</Text>

      <TextInput
        placeholder="First Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Last Name"
        value={lastname}
        onChangeText={setLastname}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        style={styles.signupButton}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.signupButtonText}>
          {loading ? "Signing Up..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Back to Login Link */}
      <Link href="/login" style={styles.linkText}>
        Go to Login
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ccccff", // Light purple
    padding: 20,
  },
  headerText: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#6a0dad",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#333",
  },
  signupButton: {
    backgroundColor: "#6a0dad",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    elevation: 3,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
  linkText: {
    color: "#6a0dad",
    fontSize: 18,
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 20,
  },
});
