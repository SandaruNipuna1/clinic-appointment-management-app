import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login, apiBaseUrl } = useAuth();
  const [baseUrl, setBaseUrl] = useState(apiBaseUrl || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      await login({ email, password, apiBaseUrl: baseUrl });
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
          Sign in with a registered account to access the role-based clinic modules.
        </Text>
      </View>

      <FormInput label="API Base URL" value={baseUrl} onChangeText={setBaseUrl} placeholder="http://192.168.x.x:5001/api" />
      <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" />
      <FormInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry={!showPassword}
        rightActionLabel={showPassword ? "Hide" : "Show"}
        onRightActionPress={() => setShowPassword((current) => !current)}
      />

      <PrimaryButton title="Login" onPress={handleLogin} />
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
