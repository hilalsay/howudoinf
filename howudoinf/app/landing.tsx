import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Landing() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch the token from AsyncStorage when the component mounts
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          setToken(storedToken); // Set the token if found
        } else {
          setError("No token found. Please login again.");
        }
      } catch (err) {
        setError("Failed to retrieve token.");
      }
    };

    fetchToken();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken"); // Clear the token from AsyncStorage
      router.push("/login"); // Navigate back to the login page
    } catch (err) {
      setError("Failed to logout.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : (
        <Text>Welcome! Your token is: {token}</Text>
      )}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
