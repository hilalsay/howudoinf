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

export default function FriendRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (!token) {
          setError("Token is missing. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://10.0.2.2:8080/friends/requests", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch friend requests.");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setRequests(data);
        } else {
          setRequests([]);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAcceptRequest = async (senderEmail: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }

      const response = await fetch("http://10.0.2.2:8080/friends/accept", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senderEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept friend request.");
      }

      // Refetch the requests after accepting
      const updatedRequests = await fetchFriendRequests(token);
      setRequests(updatedRequests); // Update the requests state
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const handleDeclineRequest = async (senderEmail: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }

      const response = await fetch("http://10.0.2.2:8080/friends/reject", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senderEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline friend request.");
      }

      // Refetch the requests after declining
      const updatedRequests = await fetchFriendRequests(token);
      setRequests(updatedRequests); // Update the requests state
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const fetchFriendRequests = async (token: string) => {
    try {
      const response = await fetch("http://10.0.2.2:8080/friends/requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friend requests.");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      return [];
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading friend requests...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Friend Requests</Text>

      {requests.length > 0 ? (
        <FlatList
          data={requests}
          keyExtractor={(item, index) => item.senderEmail || index.toString()}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text style={styles.requestText}>
                Request from: {item.senderEmail}
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptRequest(item.senderEmail)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDeclineRequest(item.senderEmail)}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noRequestsText}>You have no friend requests.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  requestItem: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  requestText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  acceptButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  declineButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  noRequestsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
});
