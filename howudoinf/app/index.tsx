import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Howudoin!</Text>

      <Link href={"./login"} asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </Link>

      <Link href={"./signup"} asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Go to Signup</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccccff", // Light purple background
    padding: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#290066",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#6a0dad",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    elevation: 3,
    width: "60%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
});
