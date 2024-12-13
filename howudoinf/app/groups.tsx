import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type Group = {
  id: string;
  name: string;
  members: string[];
  messages: any[];
};

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          throw new Error("User is not authenticated.");
        }

        const response = await fetch("http://10.0.2.2:8080/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch groups.");
        }

        const data: Group[] = await response.json();
       
        setGroups(data); // Store the fetched groups
      } catch (error: any) {
        setError(error.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupPress = async (group: Group) => {
    if (!group) {
      console.error("Group is undefined or null");
      return;
    }

    try {
      // Save the group details in AsyncStorage
      await AsyncStorage.setItem("selectedGroup", JSON.stringify(group));

      // Navigate to the group details page
      router.push("/groupdetails");
    } catch (error) {
      console.error("Failed to navigate to group details", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading groups...</Text>
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
      <Text style={styles.headerText}>Groups:</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleGroupPress(item)}>
            <View style={styles.groupItem}>
              <Text style={styles.groupText}>Group Name: {item.name}</Text>
              <Text style={styles.detailsText}>
                Members: {item.members.join(", ")}
              </Text>
              <Text style={styles.detailsText}>
                Messages: {item.messages.length}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
  groupItem: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  groupText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  detailsText: {
    fontSize: 14,
    color: "#555",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});

export default Groups;
