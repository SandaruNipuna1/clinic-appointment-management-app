import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function HomeDashboardScreen({ navigation }) {
  const { patients, refreshData } = useAppData();
  const { currentUser, logout } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Patient Management</Text>
        <Text style={styles.title}>Standalone patient records app</Text>
        <Text style={styles.subtitle}>
          Signed in as {currentUser?.fullName}. Use this workspace to manage patient profiles and keep contact details up to date.
        </Text>

        <View style={styles.topActionRow}>
          <Pressable style={styles.topActionButton} onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.topActionLabel}>View Profile</Text>
          </Pressable>
          <Pressable
            style={[styles.topActionButton, styles.logoutButton]}
            onPress={() =>
              Alert.alert("Logout", "Do you want to sign out now?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => logout() }
              ])
            }
          >
            <Text style={[styles.topActionLabel, styles.logoutLabel]}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{patients.length}</Text>
            <Text style={styles.metricLabel}>Active Patients</Text>
          </View>
        </View>
      </View>

      <InfoCard
        title="Patient Management"
        lines={[
          "View patients, add new records, update details, and search by name.",
          "Keep the clinic's basic patient contact information organized in one place."
        ]}
      >
        <PrimaryButton title="Open Patient Module" onPress={() => navigation.navigate("PatientList")} />
      </InfoCard>

      <PrimaryButton title="Refresh Patients" onPress={refreshData} variant="ghost" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#123b46",
    borderRadius: 30,
    padding: 24,
    marginBottom: 18,
    shadowColor: "#123b46",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6
  },
  topActionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14
  },
  topActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#1c5561"
  },
  logoutButton: {
    backgroundColor: "#f8dada"
  },
  topActionLabel: {
    color: "#eafffb",
    fontWeight: "700",
    fontSize: 14
  },
  logoutLabel: {
    color: "#8f1f1f"
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
    lineHeight: 22,
    marginBottom: 18
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricCard: {
    minWidth: 112,
    backgroundColor: "#1a4c57",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 92,
    justifyContent: "center",
    flexGrow: 1
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  metricLabel: {
    color: "#c2dde1",
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center"
  }
});
