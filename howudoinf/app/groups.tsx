import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Groups() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the token from AsyncStorage when the component mounts
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        setToken(storedToken);
      } catch (err) {
        console.error("Failed to retrieve token.");
      }
    };

    fetchToken();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Token's groups:</Text>
      <Text>{token}</Text>
    </View>
  );
}
