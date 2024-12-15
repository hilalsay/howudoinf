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
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!receivedResponse.ok) {
          throw new Error("Failed to fetch received friend requests.");
        }

        const receivedData = await receivedResponse.json();

        // Fetch sent requests
        const sentResponse = await fetch(
          "http://10.0.2.2:8080/friends/sent-requests",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!sentResponse.ok) {
          throw new Error("Failed to fetch sent friend requests.");
        }

        const sentData = await sentResponse.json();

        setReceivedRequests(Array.isArray(receivedData) ? receivedData : []);
        setSentRequests(Array.isArray(sentData) ? sentData : []);
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

      // Refetch received requests after accepting
      const updatedReceivedRequests = await fetchFriendRequests(
        token,
        "received"
      );
      setReceivedRequests(updatedReceivedRequests);
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

      // Refetch received requests after declining
      const updatedReceivedRequests = await fetchFriendRequests(
        token,
        "received"
      );
      setReceivedRequests(updatedReceivedRequests);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const fetchFriendRequests = async (
    token: string,
    type: "received" | "sent"
  ) => {
    try {
      const endpoint =
        type === "received"
          ? "http://10.0.2.2:8080/friends/requests"
          : "http://10.0.2.2:8080/friends/sent-requests";

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} friend requests.`);
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
    <SectionList
      sections={[
        { title: "Received Requests", data: receivedRequests },
        { title: "Sent Requests", data: sentRequests },
      ]}
      keyExtractor={(item, index) => index.toString()}
      renderSectionHeader={({ section }) => (
        <Text style={styles.subHeaderText}>{section.title}</Text>
      )}
      renderItem={({ item, section }) => (
        <View style={styles.requestItem}>
          <Text style={styles.requestText}>
            {section.title === "Received Requests" ? (
              <>
                <Text style={styles.requestText}>
                  Request from: {item.senderEmail}
                </Text>
                <Text style={styles.statusText}>
                  {"\n\n"}
                  Status:{" "}
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.requestText}>
                  Sent to: {item.receiverEmail}
                </Text>
                <Text style={styles.statusText}>
                  {"\n\n"}
                  Status:{" "}
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </>
            )}
          </Text>
          {section.title === "Received Requests" &&
            item.status == "PENDING" && (
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
      contentContainerStyle={styles.container}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7", // Lighter background color
  },
  subHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#333", // Darker text for headers
  },
  requestItem: {
    backgroundColor: "#fff", // White background for requests
    padding: 20,
    borderRadius: 12, // Rounded corners
    marginBottom: 15,
    shadowColor: "#000", // Shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow effect
  },
  requestText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5, // Space between text
  },
  statusText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#555", // Lighter color for status
    marginTop: 5,
    textAlign: "right", // Align status text to the right for better spacing
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  acceptButton: {
    backgroundColor: "#4CAF50", // Green for accept
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "48%", // Button takes up half space
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#FF5733", // Red for decline
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "48%", // Button takes up half space
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Ensure text and buttons are aligned
    marginTop: 10,
  },
  sectionList: {
    marginTop: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loadingIndicator: {
    marginBottom: 10,
  },
});
