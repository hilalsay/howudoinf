import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "./app/welcome";
import LoginScreen from "./app/login";
import SignupScreen from "./app/signup";
import LandingScreen from "./app/landing";
import Messages from "./app/messages";
import Friends from "./app/friends";
import Groups from "./app/groups";
import GroupDetails from "./app/group_detail";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Messages" component={Messages} />
      <Stack.Screen name="Friends" component={Friends} />
      <Stack.Screen name="Groups" component={Groups} />
      <Stack.Screen name="GroupDetails" component={GroupDetails} />
    </Stack.Navigator>
  );
}
