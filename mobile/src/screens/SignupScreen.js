// This is the signup screen where new users can create an account.
// Users enter their personal information to register as patients.
//
// Features:
// - Full name, email, password, and confirm password inputs
// - Password validation (minimum length, matching confirmation)
// - Email format validation
// - Creates a patient account by default

import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";

import FormInput from "../components/FormInput";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import PrimaryButton from "../components/PrimaryButton";

export default function SignupScreen() {
  const { signup } = useAuth();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle signup button press
  const handleSignup = async () => {
    // Validate full name
    if (!fullName.trim()) {
      Alert.alert("Full name required", "Please enter your full name.");
      return;
    }

    // Validate email
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email.");
      return;
    }

    // Validate passwords
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert("Password required", "Please enter and confirm your password.");
      return;
    }

    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email.");
      return;
    }

    // Check password strength
    if (password.trim().length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Password and confirm password must match.");
      return;
    }

    try {
      // Create new account with patient role
      await signup({ fullName, email, password, role: "patient" });
    } catch (error) {
      Alert.alert("Signup failed", error.message);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Register a new patient profile to book and manage clinic appointments.</Text>

      {/* Full name input */}
      <FormInput label="Full Name" value={fullName} onChangeText={setFullName} />

      {/* Email input */}
      <FormInput label="Email" value={email} onChangeText={setEmail} />

      {/* Password input with show/hide */}
      <FormInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        rightActionLabel={showPassword ? "Hide" : "Show"}
        onRightActionPress={() => setShowPassword((current) => !current)}
      />

      {/* Confirm password input with show/hide */}
      <FormInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        rightActionLabel={showConfirmPassword ? "Hide" : "Show"}
        onRightActionPress={() => setShowConfirmPassword((current) => !current)}
      />

      {/* Signup button */}
      <PrimaryButton title="Create Account" onPress={handleSignup} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 6
  },
  subtitle: {
    color: "#60757d",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16
  }
});
