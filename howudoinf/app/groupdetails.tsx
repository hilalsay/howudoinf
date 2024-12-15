import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type Group = {
  id: string;
  name: string;
  members: string[];
  messages: any[];
  createdAt?: string; // Optional field for group creation time
};

const GroupDetails: React.FC = () => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const storedGroup = await AsyncStorage.getItem("selectedGroup");
        if (storedGroup) {
          const parsedGroup = JSON.parse(storedGroup);
          setGroup(parsedGroup);
        }
      } catch (error) {
        console.error("Failed to load group details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, []);

  const handleGoToChat = async () => {
    if (!group) return;

    try {
      await AsyncStorage.setItem("currentGroup", JSON.stringify(group));
      router.push("/groupchat");
    } catch (error) {
      console.error("Failed to navigate to group chat", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Group details not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{group.name}</Text>

        {group.createdAt && (
          <Text style={styles.groupCreatedAt}>
            Created At: {new Date(group.createdAt).toLocaleString()}
          </Text>
        )}

        <Text style={styles.sectionHeader}>Members:</Text>
        <View style={styles.membersList}>
          {group.members.map((member, index) => (
            <View key={index} style={styles.memberItem}>
              <Text style={styles.memberText}>{member}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.chatButton} onPress={handleGoToChat}>
          <Text style={styles.chatButtonText}>Go to Group Chat</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ccccff",
    padding: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6a0dad",
    textAlign: "center",
    marginBottom: 15,
  },
  groupCreatedAt: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
  membersList: {
    marginBottom: 20,
  },
  memberItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  memberText: {
    fontSize: 20,
    color: "#555",
  },
  chatButton: {
    backgroundColor: "#6a0dad",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    color: "#6a0dad",
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default GroupDetails;
