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

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [friendEmail, setFriendEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const email = await AsyncStorage.getItem("friendEmail");
        const userEmail = await AsyncStorage.getItem("userEmail");

        if (!token || !email || !userEmail) {
          setError("No token or email found.");
          setLoading(false);
          return;
        }

        setUserEmail(userEmail);
        setFriendEmail(email);

        const response = await fetch(
          `http://10.0.2.2:8080/messages?userEmail2=${email}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages.");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      const email = await AsyncStorage.getItem("friendEmail");

      if (!token || !email) {
        setError("No token or friend's email found.");
        return;
      }

      const messageData = {
        receiverEmail: email,
        content: newMessage,
      };

      const response = await fetch("http://10.0.2.2:8080/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      const newMessageResponse = {
        senderEmail: userEmail,
        receiverEmail: email,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessageResponse]);
      setNewMessage("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Messages with: {friendEmail ? friendEmail : "Unknown User"}
      </Text>

      <View style={styles.messagesContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#6a0dad" />
        ) : messages.length > 0 ? (
          <FlatList
            data={messages}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => {
              const isSender = item.senderEmail === userEmail;

              return (
                <View
                  style={[
                    styles.messageItem,
                    isSender ? styles.senderMessage : styles.receiverMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{item.content}</Text>
                  <Text style={styles.timestamp}>
                    {formatTimestamp(item.timestamp)}
                  </Text>
                </View>
              );
            }}
          />
        ) : (
          <Text style={styles.noMessagesText}>No messages found.</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ccccff",
    padding: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6a0dad",
    textAlign: "center",
    marginBottom: 10,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  messageItem: {
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
    maxWidth: "75%",
    elevation: 3,
  },
  senderMessage: {
    backgroundColor: "#f2f2f2",
    alignSelf: "flex-end",
  },
  receiverMessage: {
    backgroundColor: "#e0e0eb",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  noMessagesText: {
    fontSize: 16,
    color: "#6a0dad",
    textAlign: "center",
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#6a0dad",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 3,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
