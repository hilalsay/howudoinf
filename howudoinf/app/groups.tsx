import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type Group = {
  id: string;
  name: string;
  members: string[];
};

type Friend = string;

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchGroupsAndFriends = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) throw new Error("User is not authenticated.");

        const groupResponse = await fetch("http://10.0.2.2:8080/user", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!groupResponse.ok) throw new Error("Failed to fetch groups.");
        const groupData: Group[] = await groupResponse.json();
        setGroups(groupData);

        const friendResponse = await fetch("http://10.0.2.2:8080/friends", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!friendResponse.ok) throw new Error("Failed to fetch friends.");
        const friendData: Friend[] = await friendResponse.json();
        setFriends(friendData);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupsAndFriends();
  }, []);

  const handleGroupPress = async (group: Group) => {
    try {
      await AsyncStorage.setItem("selectedGroup", JSON.stringify(group));
      router.push("/groupdetails");
    } catch (error) {
      Alert.alert("Error", "Could not open group details.");
    }
  };

  const handleCreateGroup = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("User is not authenticated.");

      const response = await fetch("http://10.0.2.2:8080/groups/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName,
          members: selectedFriends,
        }),
      });

      if (!response.ok) throw new Error("Failed to create the group.");
      const createdGroup: Group = await response.json();

      setGroups((prevGroups) => [...prevGroups, createdGroup]);
      setShowCreateForm(false);
      setNewGroupName("");
      setSelectedFriends([]);
      Alert.alert("Success", "Group created successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create the group.");
    }
  };

  const toggleFriendSelection = (email: string) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(email)
        ? prevSelected.filter((friend) => friend !== email)
        : [...prevSelected, email]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showCreateForm ? (
        <View style={styles.form}>
          <Text style={styles.formHeader}>Create a New Group</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Group Name"
            value={newGroupName}
            onChangeText={setNewGroupName}
          />
          <Text style={styles.sectionHeader}>Select Friends</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.friendItem,
                  selectedFriends.includes(item) && styles.selectedFriend,
                ]}
                onPress={() => toggleFriendSelection(item)}
              >
                <Text style={styles.friendText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.purpleButton} onPress={handleCreateGroup}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreateForm(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleGroupPress(item)}>
                <View style={styles.groupItem}>
                  <Text style={styles.groupText}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.groupList}
          />
          <TouchableOpacity
            style={styles.createGroupButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Text style={styles.createGroupButtonText}>+</Text>
          </TouchableOpacity>
        </>
      )}
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
  loadingText: { fontSize: 18, color: "#6a0dad" },
  errorText: { color: "red", fontSize: 16 },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    marginVertical: 20,
  },
  formHeader: { fontSize: 26, fontWeight: "bold", color: "#6a0dad", marginBottom: 15 },
  sectionHeader: { fontSize: 18, fontWeight: "600", color: "#333", marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
    marginBottom: 15,
  },
  friendItem: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e6e6e6",
    marginBottom: 5,
  },
  selectedFriend: { backgroundColor: "#D3BDF0" },
  friendText: { fontSize: 16, color: "#333" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
  purpleButton: {
    backgroundColor: "#6a0dad",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#888",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  groupItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: "#e6e6ff",
    alignItems: "center",
    elevation: 2,
  },
  groupText: { fontSize: 18, color: "#333", fontWeight: "bold" },
  createGroupButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6a0dad",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  createGroupButtonText: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  groupList: {
    paddingBottom: 80, // Ensures extra padding at the bottom for scrollability
  }
});

export default Groups;
