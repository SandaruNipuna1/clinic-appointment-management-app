// This is the login screen where users enter their email and password.
// Users can sign in with existing accounts or create a new account.
//
// Features:
// - Email input with validation
// - Password input with show/hide toggle
// - Form validation (required fields, valid email format)
// - Navigate to signup screen for new users

import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle login button press
  const handleLogin = async () => {
    // Check that both fields are filled
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email.");
      return;
    }

    try {
      // Attempt to login with provided credentials
      await login({ email, password });
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <ScreenContainer>
      {/* Hero card with welcome message */}
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Welcome Back</Text>
        <Text style={styles.title}>Login to Clinic Management</Text>
        <Text style={styles.subtitle}>
          Sign in with a registered account to access the role-based clinic modules.
        </Text>
      </View>

      {/* Email input field */}
      <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" />

      {/* Password input field with show/hide toggle */}
      <FormInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry={!showPassword}
        rightActionLabel={showPassword ? "Hide" : "Show"}
        onRightActionPress={() => setShowPassword((current) => !current)}
      />

      {/* Login button */}
      <PrimaryButton title="Login" onPress={handleLogin} />

      {/* Signup link */}
      <PrimaryButton title="Create New Account" onPress={() => navigation.navigate("Signup")} variant="secondary" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#123b46",
    borderRadius: 30,
    padding: 24,
    marginBottom: 18
  },
  eyebrow: {
    color: "#8de4d3",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10
  },
  title: {
    color: "#f5fffd",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 10
  },
  subtitle: {
    color: "#c3dbe0",
    fontSize: 15,
    lineHeight: 22
  }
});
