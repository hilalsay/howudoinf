import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FriendRequests() {
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          setError("Token is missing. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch received requests
        const receivedResponse = await fetch(
          "http://10.0.2.2:8080/friends/requests",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const sentResponse = await fetch(
          "http://10.0.2.2:8080/friends/sent-requests",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!receivedResponse.ok || !sentResponse.ok)
          throw new Error("Failed to fetch friend requests.");

        setReceivedRequests(await receivedResponse.json());
        setSentRequests(await sentResponse.json());
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

      // Update the status in the local state
      setReceivedRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.senderEmail === senderEmail
            ? { ...request, status: "ACCEPTED" }
            : request
        )
      );
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

      // Update the status in the local state
      setReceivedRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.senderEmail === senderEmail
            ? { ...request, status: "REJECTED" }
            : request
        )
      );
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Loading friend requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Friend Requests</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <SectionList
        sections={[
          { title: "Received Requests", data: receivedRequests },
          { title: "Sent Requests", data: sentRequests },
        ]}
        keyExtractor={(item, index) => index.toString()}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderBox}>
            <Text style={styles.subHeaderText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item, section }) => (
          <View style={styles.requestCard}>
            <Text style={styles.requestText}>
              {section.title === "Received Requests"
                ? `From: ${item.senderEmail}`
                : `To: ${item.receiverEmail}`}
            </Text>
            <Text style={styles.statusText}>Status: {item.status}</Text>
            {section.title === "Received Requests" &&
              item.status === "PENDING" && ( // Show buttons only for pending requests
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
              )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ccccff",
    padding: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6a0dad",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionHeaderBox: {
    borderWidth: 2, // Purple border
    borderColor: "#6a0dad", // Purple color
    borderRadius: 12, // Rounded corners
    backgroundColor: "#6a0dad", // Light purple background
    paddingVertical: 10, // Top and bottom padding
    paddingHorizontal: 15, // Left and right padding
    marginVertical: 20, // Spacing between sections
    alignItems: "flex-start", // Center align text
  },
  subHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff", // White text
  },
  requestCard: {
    backgroundColor: "#F1E6FF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  requestText: {
    fontSize: 16,
    color: "#333",
  },
  statusText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "#8310d5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#888",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6a0dad",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
});
