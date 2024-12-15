import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type Group = {
  id: string;
  name: string;
  members: string[];
  messages: any[];
};

const GroupDetails: React.FC = () => {
  const [group, setGroup] = useState<Group | null>(null);
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
      }
    };

    fetchGroupDetails();
  }, []);

  const handleGoToChat = async () => {
    if (!group) return;

    try {
      // Save the current group details to AsyncStorage
      await AsyncStorage.setItem("currentGroup", JSON.stringify(group));

      // Navigate to the GroupChat page
      router.push("/groupchat");
    } catch (error) {
      console.error("Failed to navigate to group chat", error);
    }
  };

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Loading group details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Details</Text>
      <Text style={styles.groupName}>Group Name: {group.name}</Text>
      <Text style={styles.groupId}>Group ID: {group.id}</Text>
      <Text style={styles.membersTitle}>Members:</Text>
      {group.members.map((member, index) => (
        <Text key={index} style={styles.member}>
          {member}
        </Text>
      ))}
      <Button title="Go to Group Chat" onPress={handleGoToChat} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  groupName: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
  },
  groupId: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  member: {
    fontSize: 14,
    color: "#555",
  },
});

export default GroupDetails;
