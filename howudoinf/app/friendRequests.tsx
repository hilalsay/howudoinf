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
    console.log(`Accepted: ${senderEmail}`);
  };

  const handleDeclineRequest = async (senderEmail: string) => {
    console.log(`Declined: ${senderEmail}`);
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
            {section.title === "Received Requests" && item.status === "PENDING" && (
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
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
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
  sectionHeaderBox: {
    borderWidth: 2,                // Purple border
    borderColor: "#6a0dad",        // Purple color
    borderRadius: 12,              // Rounded corners
    backgroundColor: "#6a0dad",    // Light purple background
    paddingVertical: 10,           // Top and bottom padding
    paddingHorizontal: 15,         // Left and right padding
    marginVertical: 20,            // Spacing between sections
    alignItems: "flex-start",          // Center align text
  },
  subHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",                 // Black text
  }
});
