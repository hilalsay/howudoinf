import React, { useState } from "react";
import { Button, TextInput, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // Get the router for navigation

  const handleLogin = async () => {
    try {
      const response = await fetch("http://10.0.2.2:8080/login", {
        // Use 10.0.2.2 here
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Check if the response is not OK
      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      // Read the response body as text first
      const responseText = await response.text();

      // Try parsing it as JSON if it's a valid JSON string
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        // If it's not a valid JSON, treat it as a plain token string
        data = responseText;
      }

      // If the response is a string (token), save it
      const token = typeof data === "string" ? data : data.token;

      if (token) {
        // Save the token in AsyncStorage
        await AsyncStorage.setItem("authToken", token);
        console.log("Login successful, token saved.");

        // Navigate to the landing page after successful login
        router.push("/landing"); // Directs to the Landing page
      } else {
        setError("Token not received from server.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      console.error(err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 20, padding: 10, borderWidth: 1 }}
      />
      <Button title="Login" onPress={handleLogin} />
      {error && <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>}
    </View>
  );
}
