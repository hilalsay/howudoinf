import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
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
        const token = await AsyncStorage.getItem("authToken");
        const storedGroup = await AsyncStorage.getItem("selectedGroup");

        if (!token || !storedGroup) {
          throw new Error("Authentication or group details missing.");
        }

        const parsedGroup: Group = JSON.parse(storedGroup);
        setGroup(parsedGroup);
        setMessages(parsedGroup.messages);

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

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderEmail: currentUserEmail || "You",
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{group?.name}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => {
          const isMyMessage = item.senderEmail === currentUserEmail;
          return (
            <View
              style={[
                styles.messageBox,
                isMyMessage ? styles.myMessage : styles.otherMessage,
              ]}
            >
              {!isMyMessage && (
                <Text style={styles.senderEmail}>{item.senderEmail}</Text>
              )}
              {isMyMessage && (
                <Text style={styles.senderEmail}>You</Text>
                )}
              <Text style={styles.messageContent}>{item.content}</Text>
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
          placeholder="Type a message..."
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
    backgroundColor: "#ccccff",
    padding: 10,
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
  header: {
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
  messageBox: {
    borderRadius: 20,
    padding: 8,
    marginVertical: 5,
    maxWidth: "75%",
    elevation:3,
  },
  myMessage: {
    backgroundColor: "#f2f2f2",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#e0e0eb",
    alignSelf: "flex-start",
  },
  senderEmail: {
    fontSize: 18,
    color: "#6a0dad",
    marginBottom: 5,
    fontWeight: "600",
  },
  messageContent: {
    fontSize: 18,
    color: "#333",
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    marginTop: 10,
    alignSelf: "flex-end",
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
    elevation: 2,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default GroupChat;
