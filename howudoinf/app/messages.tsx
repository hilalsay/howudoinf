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
  const [messages, setMessages] = useState<any[]>([]); // Store messages
  const [friendEmail, setFriendEmail] = useState<string | null>(null); // Store friend email
  const [loading, setLoading] = useState<boolean>(true); // Track loading state
  const [error, setError] = useState<string | null>(null); // Track error state
  const [userEmail, setUserEmail] = useState<string | null>(null); // Store current user's email
  const [newMessage, setNewMessage] = useState<string>(""); // Store new message input

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Retrieve the user's token, email, and friend's email
        const token = await AsyncStorage.getItem("authToken");
        const email = await AsyncStorage.getItem("friendEmail");
        const userEmail = await AsyncStorage.getItem("userEmail"); // Retrieve current user's email

        if (!token || !email || !userEmail) {
          setError("No token or email found.");
          setLoading(false);
          return;
        }

        setUserEmail(userEmail); // Set the current user's email
        setFriendEmail(email); // Set the friend's email

        // Make the GET request to fetch messages
        const response = await fetch(
          `http://10.0.2.2:8080/messages?userEmail2=${email}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Send the token in the Authorization header
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages.");
        }

        const data = await response.json();

        // If the response is an array, set the messages
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
    if (!newMessage.trim()) return; // Do not send empty messages

    try {
      // Retrieve the user's token and friend's email
      const token = await AsyncStorage.getItem("authToken");
      const email = await AsyncStorage.getItem("friendEmail");

      if (!token || !email) {
        setError("No token or friend's email found.");
        return;
      }

      // Prepare message data
      const messageData = {
        receiverEmail: email,
        content: newMessage,
      };

      // Send the message via POST request
      const response = await fetch("http://10.0.2.2:8080/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      // Handle plain text response (e.g., "Message sent successfully")
      const responseText = await response.text(); // Get the response as text

      // Optionally, you can log or display the response message if needed
      console.log(responseText); // For debugging

      // Since the message was successfully sent, update the message list
      const newMessageResponse = {
        senderEmail: userEmail,
        receiverEmail: email,
        content: newMessage,
      };

      // Add the new message to the list of messages
      setMessages((prevMessages) => [
        ...prevMessages,
        newMessageResponse, // Assuming response contains the sent message
      ]);
      setNewMessage(""); // Clear the input field
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Messages with: {friendEmail ? friendEmail : "Unknown User"}
      </Text>

      {/* Messages section */}
      <View style={styles.messagesContainer}>
        {messages.length > 0 ? (
          <FlatList
            data={messages}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => {
              // Determine if the current user is the sender or receiver
              const isSender = item.senderEmail === userEmail;

              return (
                <View
                  style={[
                    styles.messageItem,
                    isSender ? styles.senderMessage : styles.receiverMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isSender ? styles.senderText : styles.receiverText,
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              );
            }}
          />
        ) : (
          <Text style={styles.noMessagesText}>No messages found.</Text>
        )}
      </View>

      {/* Input and Send Message Section */}
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
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  messagesContainer: {
    flex: 1, // Take up available space
    marginBottom: 20, // Add space above the input area
  },
  messageItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "80%", // Limit message width
  },
  senderMessage: {
    backgroundColor: "#d0f0c0", // Light green for sender
    alignSelf: "flex-end", // Align sender messages to the right
  },
  receiverMessage: {
    backgroundColor: "#f0f0f0", // Light gray for receiver
    alignSelf: "flex-start", // Align receiver messages to the left
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  senderText: {
    textAlign: "right", // Align text to the right for sender
  },
  receiverText: {
    textAlign: "left", // Align text to the left for receiver
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  noMessagesText: {
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
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
});
