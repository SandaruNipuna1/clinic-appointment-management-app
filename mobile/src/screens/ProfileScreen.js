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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Missing fields", "Full name and email are required.");
      return;
    }

    const isChangingPassword = Boolean(currentPassword.trim() || newPassword.trim() || confirmNewPassword.trim());

    if (isChangingPassword) {
      if (!currentPassword.trim()) {
        Alert.alert("Current password required", "Please enter your current password.");
        return;
      }

      if (!newPassword.trim() || !confirmNewPassword.trim()) {
        Alert.alert("New password required", "Please enter and confirm your new password.");
        return;
      }

      if (newPassword.trim().length < 6) {
        Alert.alert("Weak password", "Password must be at least 6 characters.");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        Alert.alert("Password mismatch", "New password and confirm password must match.");
        return;
      }
    }

    try {
      await updateProfile({
        fullName,
        email,
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim()
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (error) {
      Alert.alert("Save failed", error.message);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Review your account details, role, and sign out when you finish using the app.</Text>

      <InfoCard
        title={currentUser?.fullName || "Profile"}
        lines={[
          `Email: ${currentUser?.email || "-"}`,
          `Role: ${currentUser?.role || "-"}`
        ].concat(currentUser?.role === "admin" ? [`User ID: ${currentUser?.id || "-"}`] : [])
      }
      />

      <View style={styles.panel}>
        <FormInput label="Full Name" value={fullName} onChangeText={setFullName} />
        <FormInput label="Email" value={email} onChangeText={setEmail} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <Text style={styles.sectionHint}>Leave these blank if you do not want to change your password.</Text>
        <FormInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrentPassword}
          rightActionLabel={showCurrentPassword ? "Hide" : "Show"}
          onRightActionPress={() => setShowCurrentPassword((current) => !current)}
        />
        <FormInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
          rightActionLabel={showNewPassword ? "Hide" : "Show"}
          onRightActionPress={() => setShowNewPassword((current) => !current)}
        />
        <FormInput
          label="Confirm New Password"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry={!showConfirmNewPassword}
          rightActionLabel={showConfirmNewPassword ? "Hide" : "Show"}
          onRightActionPress={() => setShowConfirmNewPassword((current) => !current)}
        />
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 4
  },
  sectionHint: {
    color: "#60757d",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14
  }
});
