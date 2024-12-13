import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Messages() {
  const [friendEmail, setFriendEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriendEmail = async () => {
      try {
        const email = await AsyncStorage.getItem("friendEmail");
        if (email) {
          setFriendEmail(email);
        } else {
          console.error("No friend email found in AsyncStorage.");
        }
      } catch (error) {
        console.error("Failed to fetch friend's email", error);
      }
    };

    fetchFriendEmail();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Messages with: {friendEmail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
});
