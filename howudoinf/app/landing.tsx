import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Landing() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        console.log("Token fetched:", storedToken); // Debugging log
        if (storedToken) {
          setToken(storedToken);
        } else {
          setError("No token found. Please login again.");
        }
      } catch (err) {
        setError("Failed to retrieve token.");
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    fetchToken();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      router.push("/login");
    } catch (err) {
      setError("Failed to logout.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logout Button at Top Right */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Welcome Header */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <Text style={styles.welcomeText}>Welcome!</Text>
        </>
      )}

      {/* Groups and Friends Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.purpleButton}
          onPress={() => router.push("/groups")}
        >
          <Text style={styles.buttonText}>My Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.purpleButton}
          onPress={() => router.push("/friends")}
        >
          <Text style={styles.buttonText}>My Friends</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ccccff", // Light lavender background
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
  },
  welcomeText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#33334d",
    marginBottom:70,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6a0dad",
    marginTop: 10,
  },
  logoutButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#888",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  buttonContainer: {
    marginTop: 20,
    width: "80%",
  },
  purpleButton: {
    backgroundColor: "#6a0dad",
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 2,
    marginVertical: 15, // Spacing between buttons
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
});
