import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Message = {
  senderEmail: string;
  content: string;
  timestamp: string;
};

type Group = {
  id: string;
  name: string;
  members: string[];
  messages: Message[];
};

const GroupChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    const fetchGroupChatDetails = async () => {
      try {
        // Get auth token and group details from AsyncStorage
        const token = await AsyncStorage.getItem("authToken");
        const storedGroup = await AsyncStorage.getItem("selectedGroup");

        if (!token || !storedGroup) {
          throw new Error("Authentication or group details missing.");
        }

        const parsedGroup: Group = JSON.parse(storedGroup);
        setGroup(parsedGroup);
        setMessages(parsedGroup.messages); // Load existing messages

        // Retrieve current user email from token or AsyncStorage
        const userEmail = await AsyncStorage.getItem("userEmail");
        if (!userEmail) {
          throw new Error("Unable to fetch user email.");
        }

        setCurrentUserEmail(userEmail);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupChatDetails();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !group) return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      // Send the message to the backend
      const response = await fetch(
        `http://10.0.2.2:8080/groups/${group.id}/send?content=${encodeURIComponent(
          newMessage
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send the message.");
      }

      // Add new message to the messages list
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderEmail: currentUserEmail || "Unknown",
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage(""); // Clear the input field
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading chat...</Text>
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
      <Text style={styles.headerText}>{group?.name}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const isMyMessage = item.senderEmail === currentUserEmail;
          return (
            <View
              style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessage : styles.otherMessage,
              ]}
            >
              {!isMyMessage && (
                <Text style={styles.senderEmail}>{item.senderEmail}</Text>
              )}
              <Text style={styles.content}>{item.content}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          );
        }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d4f8d4",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
  },
  senderEmail: {
    fontSize: 12,
    color: "#888",
  },
  content: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});

export default GroupChat;
