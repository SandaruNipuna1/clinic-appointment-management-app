// This is the signup screen where new users can create an account.
// Users enter their personal information to register as patients.
//
// Features:
// - Full name, email, password, and confirm password inputs
// - Password validation (minimum length, matching confirmation)
// - Email format validation
// - Creates a patient account by default

import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import PrimaryButton from "../components/PrimaryButton";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

export default function SignupScreen() {
  const { signup } = useAuth();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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

    if (!dateOfBirth.trim() || !gender.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Patient details required", "Please enter your date of birth, gender, phone, and address.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      Alert.alert("Invalid date of birth", "Please use YYYY-MM-DD format.");
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
      await signup({
        fullName,
        email,
        password,
        role: "patient",
        dateOfBirth,
        gender,
        phone,
        address
      });
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

      {/* Patient profile inputs */}
      <FormInput label="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="2002-05-14" />

      <Text style={styles.filterLabel}>Gender</Text>
      <View style={styles.filterWrap}>
        {GENDER_OPTIONS.map((option) => (
          <PrimaryButton key={option} title={option} onPress={() => setGender(option)} variant={gender === option ? "primary" : "ghost"} />
        ))}
      </View>

      <FormInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <FormInput label="Address" value={address} onChangeText={setAddress} multiline />

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
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#4b6972",
    marginBottom: 10
  },
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16
  }
});
