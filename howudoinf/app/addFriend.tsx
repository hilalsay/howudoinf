import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { debounce } from "lodash"; // Optional: to debounce the search input

export default function AddFriend() {
  const [friendEmail, setFriendEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null); // Store only one selected friend
  const router = useRouter();

  const handleAddFriend = async () => {
    if (!selectedFriend) {
      setError("Please select a friend to add.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }

      const response = await fetch("http://10.0.2.2:8080/friends/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverEmail: selectedFriend }), // Send selected friend's email
      });

      if (!response.ok) {
        throw new Error("Failed to add friend.");
      }

      // Navigate back to Friends page after adding
      router.push("/friends");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const fetchSearchResults = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }

      setLoading(true);
      const response = await fetch(
        `http://10.0.2.2:8080/search?query=${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search for users.");
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, 500); // 500ms debounce

  useEffect(() => {
    if (friendEmail.trim()) {
      fetchSearchResults(friendEmail);
    } else {
      setSearchResults([]);
    }
  }, [friendEmail]);

  const handleSelection = (email: string) => {
    setSelectedFriend(email); // Set selected friend to the clicked email
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Add New Friend</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Search for a friend by email or name"
        value={friendEmail}
        onChangeText={(text) => setFriendEmail(text)}
      />

      {loading ? (
        <Text style={styles.loadingText}>Searching...</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.email}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.searchResult,
                selectedFriend === item.email && styles.selectedResult, // Highlight selected friend
              ]}
              onPress={() => handleSelection(item.email)} // Set this email as selected
            >
              <Text style={styles.resultText}>
                {item.firstName} {item.lastName} {item.email}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No results found</Text>}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
        <Text style={styles.addButtonText}>Add Selected Friend</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ccccff", // Light purple background
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6a0dad", // Consistent purple header
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#6a0dad", // Purple border
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#fff",
    color: "#333",
    marginBottom: 20,
    fontSize: 16,
    elevation: 2,
  },
  addButton: {
    backgroundColor: "#6a0dad", // Consistent purple button
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    elevation: 3,
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    color: "#6a0dad",
    textAlign: "center",
    marginVertical: 10,
  },
  searchResult: {
    padding: 15,
    backgroundColor: "#f3e8ff", // Light purple for result box
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#6a0dad",
    elevation: 2,
  },
  selectedResult: {
    backgroundColor: "#d1b3ff", // Brighter purple for selected results
    borderWidth: 2,
    borderColor: "#6a0dad",
  },
  resultText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
});
