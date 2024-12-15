import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Friends() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (!token) {
          setError("Token is missing. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://10.0.2.2:8080/friends`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch friends.");
        }

        const data = await response.json();
        setFriends(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleFriendPress = async (friendEmail: string) => {
    try {
      await AsyncStorage.setItem("friendEmail", friendEmail);
      router.push("/messages");
    } catch (error) {
      console.error("Failed to store friend's email", error);
    }
  };

  const navigateToFriendRequests = () => {
    router.push("/friendRequests");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Your Friends</Text>

      {/* Friends List */}
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          keyExtractor={(item, index) => item || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleFriendPress(item)}>
              <View style={styles.friendItem}>
                <Text style={styles.friendText}>{item}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.friendList}
        />
      ) : (
        <Text style={styles.noFriendsText}>You have no friends yet.</Text>
      )}

      {/* Buttons Fixed at Bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={navigateToFriendRequests}>
          <Text style={styles.buttonText}>Go to Friend Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/addFriend")}>
          <Text style={styles.buttonText}>Add a New Friend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ccccff",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6a0dad",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#6a0dad",
    textAlign: "center",
    marginBottom: 20,
  },
  friendItem: {
    backgroundColor: "#E8EAF6", // Light purple box
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },
  friendText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000", // Black text for names
  },
  noFriendsText: {
    fontSize: 18,
    color: "#6a0dad",
    textAlign: "center",
    marginTop: 20,
  },
  buttonContainer: {
    position: "absolute", // Fixed at the bottom
    bottom: 20,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: "#6a0dad",
    paddingVertical: 12,
    borderRadius: 30, // Rounder buttons
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  friendList: {
    paddingBottom: 150, // Ensure content does not overlap with buttons
  },
});
