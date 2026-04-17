import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@clinic.demo");
  const [password, setPassword] = useState("admin123");

  const handleLogin = async () => {
    try {
      await login({ email, password });
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Welcome Back</Text>
        <Text style={styles.title}>Login to Clinic Management</Text>
        <Text style={styles.subtitle}>
          Use a demo account or create your own to access role-based clinic modules.
        </Text>
      </View>

      <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="admin@clinic.demo" />
      <FormInput label="Password" value={password} onChangeText={setPassword} placeholder="Enter password" />

      <PrimaryButton title="Login" onPress={handleLogin} />
      <PrimaryButton title="Create New Account" onPress={() => navigation.navigate("Signup")} variant="secondary" />

      <View style={styles.demoCard}>
        <Text style={styles.demoTitle}>Demo accounts</Text>
        <Text style={styles.demoText}>Admin: `admin@clinic.demo` / `admin123`</Text>
        <Text style={styles.demoText}>Receptionist: `reception@clinic.demo` / `reception123`</Text>
        <Text style={styles.demoText}>Patient: `patient@clinic.demo` / `patient123`</Text>
      </View>
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
  },
  demoCard: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dde8ee"
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 10
  },
  demoText: {
    color: "#60757d",
    marginBottom: 6,
    lineHeight: 20
  }
});
