import React from "react";
import { Button, View, Text } from "react-native";
import { Link } from "expo-router";

export default function Login() {
  return (
    <View>
      <Text>Login Screen</Text>
      {/* Use the correct string path format */}
      <Link href={"./landing"}>
        <Button title="Go to Landing Page" />
      </Link>
    </View>
  );
}
