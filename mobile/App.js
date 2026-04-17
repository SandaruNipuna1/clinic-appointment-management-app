import React from "react";
import { StatusBar } from "expo-status-bar";

import { AppDataProvider } from "./src/context/AppDataContext";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AppDataProvider>
    </AuthProvider>
  );
}
