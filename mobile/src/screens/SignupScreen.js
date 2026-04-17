import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";

const ROLE_OPTIONS = ["patient", "receptionist", "admin"];

export default function SignupScreen() {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email.");
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    try {
      await signup({ fullName, email, password, role });
    } catch (error) {
      Alert.alert("Signup failed", error.message);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Register a new profile and choose the role-based experience you need.</Text>
      <FormInput label="Full Name" value={fullName} onChangeText={setFullName} />
      <FormInput label="Email" value={email} onChangeText={setEmail} />
      <FormInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        rightActionLabel={showPassword ? "Hide" : "Show"}
        onRightActionPress={() => setShowPassword((current) => !current)}
      />

      <Text style={styles.roleLabel}>Choose role</Text>
      <View style={styles.roleWrap}>
        {ROLE_OPTIONS.map((option) => (
          <PrimaryButton
            key={option}
            title={option}
            onPress={() => setRole(option)}
            variant={role === option ? "primary" : "ghost"}
          />
        ))}
      </View>

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
  roleLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#4b6972",
    marginBottom: 10
  },
  roleWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8
  }
});
