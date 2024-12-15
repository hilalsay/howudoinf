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
                     {!isSender && (
        <Text style={styles.senderEmail}>{item.senderEmail}</Text>
      )}
      <Text style={styles.messageText}>{item.content}</Text>
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
    backgroundColor: "#ccccff", // Light lavender background
    padding: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6a0dad", // Purple text
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
    maxWidth: "75%", // Messages won't span full width
    elevation: 3, // Shadow for depth
  },
  senderMessage: {
    backgroundColor: "#f2f2f2", // Light gray for sender
    alignSelf: "flex-end", // Align to the right
  },
  receiverMessage: {
    backgroundColor: "#e0e0eb", // Light purple for receiver
    alignSelf: "flex-start", // Align to the left
  },
  senderEmail: {
    fontSize: 14,
    color: "#6a0dad", // Purple for sender email
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "right",
  },
  messageText: {
    fontSize: 16,
    color: "#333", // Darker text color for message content
  },
  noMessagesText: {
    fontSize: 16,
    color: "#6a0dad", // Purple for no messages
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
    backgroundColor: "#6a0dad", // Purple button
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 3,
  },
  sendButtonText: {
    color: "#fff", // White text
    fontSize: 15,
    fontWeight: "bold",
  },
});

