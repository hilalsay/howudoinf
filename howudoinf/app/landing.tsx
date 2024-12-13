import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function Landing() {
  const [userName, setUserName] = useState<string | null>(null);

  // Simulating fetching user data (e.g., from a login response)
  useEffect(() => {
    setUserName("John Doe"); // Replace with actual data fetching logic
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Welcome {userName ? userName : "User"}!
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        You have successfully logged in!
      </Text>

      {/* Example Link to navigate to another page (e.g., profile) */}
      {/* <Link href="/profile">
        <Button title="Go to Profile" />
      </Link> */}
    </View>
  );
}
