import React from "react";
import { Button, View, Text } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View>
      <Text>Welcome to the App</Text>
      <Link href={"./login"}>Go to Login</Link>
      <Link href={"./signup"}>Go to Signup</Link>
    </View>
  );
}
