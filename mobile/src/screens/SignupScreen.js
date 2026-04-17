import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import PrimaryButton from "../components/PrimaryButton";

const ROLE_OPTIONS = [
  {
    value: "patient",
    label: "Patient",
    description: "Book appointments"
  },
  {
    value: "receptionist",
    label: "Receptionist",
    description: "Manage schedules"
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full system access"
  }
];

export default function SignupScreen() {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim()) {
      Alert.alert("Full name required", "Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email.");
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert("Password required", "Please enter and confirm your password.");
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

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Password and confirm password must match.");
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
      <FormInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        rightActionLabel={showConfirmPassword ? "Hide" : "Show"}
        onRightActionPress={() => setShowConfirmPassword((current) => !current)}
      />

      <Text style={styles.roleLabel}>Choose role</Text>
      <View style={styles.roleWrap}>
        {ROLE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[styles.roleCard, role === option.value && styles.roleCardActive]}
            onPress={() => setRole(option.value)}
          >
            <Text style={[styles.roleTitle, role === option.value && styles.roleTitleActive]}>{option.label}</Text>
            <Text style={[styles.roleDescription, role === option.value && styles.roleDescriptionActive]}>
              {option.description}
            </Text>
          </Pressable>
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
    gap: 10,
    marginBottom: 14
  },
  roleCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d6e4ea",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 4
  },
  roleCardActive: {
    backgroundColor: "#123b46",
    borderColor: "#123b46",
    shadowColor: "#123b46",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  roleTitle: {
    color: "#17303b",
    fontSize: 19,
    fontWeight: "800"
  },
  roleTitleActive: {
    color: "#f7fffe"
  },
  roleDescription: {
    color: "#60757d",
    fontSize: 13,
    lineHeight: 18
  },
  roleDescriptionActive: {
    color: "#c8e1e5"
  }
});
