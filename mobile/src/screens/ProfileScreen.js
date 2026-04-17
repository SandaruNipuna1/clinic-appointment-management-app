import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { currentUser, updateProfile, logout } = useAuth();
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Missing fields", "Full name and email are required.");
      return;
    }

    await updateProfile({ fullName, email });
    Alert.alert("Saved", "Profile updated successfully.");
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Review your account details, role, and sign out when you finish the demo.</Text>

      <InfoCard
        title={currentUser?.fullName || "Profile"}
        lines={[
          `User ID: ${currentUser?.id || "-"}`,
          `Email: ${currentUser?.email || "-"}`,
          `Role: ${currentUser?.role || "-"}`
        ]}
      />

      <View style={styles.panel}>
        <FormInput label="Full Name" value={fullName} onChangeText={setFullName} />
        <FormInput label="Email" value={email} onChangeText={setEmail} />
      </View>

      <PrimaryButton title="Save Profile" onPress={handleSave} />
      <PrimaryButton title="Logout" onPress={logout} variant="ghost" />
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
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#dde8ee"
  }
});
