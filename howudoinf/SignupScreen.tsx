import React from "react";
import { Button, View, Text } from "react-native";
import { Link } from "expo-router";

export default function Signup() {
  return (
    <View>
      <Text>Signup Screen</Text>
      <Link href={"./login"}>
        <Button title="Back to Login" />
      </Link>
    </View>
  );
}
