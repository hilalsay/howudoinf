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
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  searchResult: {
    padding: 15,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedResult: {
    backgroundColor: "#007BFF", // Highlight the selected friend's result
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
});
