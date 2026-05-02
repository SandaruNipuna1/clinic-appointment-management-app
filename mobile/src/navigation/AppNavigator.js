import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import HomeDashboardScreen from "../screens/HomeDashboardScreen";
import LoginScreen from "../screens/LoginScreen";
import PatientFormScreen from "../screens/PatientFormScreen";
import PatientListScreen from "../screens/PatientListScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SignupScreen from "../screens/SignupScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isReady } = useAppData();
  const { currentUser, isReady: isAuthReady } = useAuth();

  if (!isReady || !isAuthReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={currentUser ? "Home" : "Login"}
        screenOptions={{
          headerLargeTitle: false,
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#f3f8fb"
          },
          headerTitleStyle: {
            color: "#17303b",
            fontWeight: "700"
          }
        }}
      >
        {currentUser ? (
          <>
            <Stack.Screen name="Home" component={HomeDashboardScreen} options={{ title: "Home" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
            <Stack.Screen name="PatientList" component={PatientListScreen} options={{ title: "Patient Management" }} />
            <Stack.Screen name="PatientForm" component={PatientFormScreen} options={{ title: "Patient Form" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Sign Up" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
