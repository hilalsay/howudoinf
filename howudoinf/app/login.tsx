import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://10.0.2.2:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const responseText = await response.text();
      const token = responseText;

      if (token) {
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("userEmail", email);
        router.push("/landing");
      } else {
        setError("Token not received from server.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
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

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Styled "Sign Up" Text Button */}
      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ccccff",
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
  loginButton: {
    backgroundColor: "#6a0dad",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    elevation: 3,
  },
  loginButtonText: {
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
});
