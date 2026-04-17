import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const ROLE_META = {
  patient: {
    label: "Patient",
    badgeStyle: "patient"
  },
  receptionist: {
    label: "Receptionist",
    badgeStyle: "receptionist"
  },
  admin: {
    label: "Admin",
    badgeStyle: "admin"
  }
};

export default function HomeDashboardScreen({ navigation }) {
  const { doctors, appointments, reports, resetDemoData } = useAppData();
  const { currentUser, logout } = useAuth();
  const roleMeta = ROLE_META[currentUser?.role] || ROLE_META.patient;

  const canManageDoctors = ["admin", "receptionist"].includes(currentUser?.role);
  const canManageAppointments = ["admin", "receptionist", "patient"].includes(currentUser?.role);
  const canManageReports = ["admin", "patient"].includes(currentUser?.role);
  const summaryCards = [
    canManageDoctors ? { key: "doctors", value: doctors.length, label: "Doctors" } : null,
    canManageAppointments ? { key: "appointments", value: appointments.length, label: "Appointments" } : null,
    canManageReports ? { key: "reports", value: reports.length, label: "Reports" } : null
  ].filter(Boolean);

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Clinic Management System</Text>
        <Text style={styles.title}>Simple clinic management app</Text>
        <View
          style={[
            styles.roleBadge,
            roleMeta.badgeStyle === "patient"
              ? styles.roleBadgePatient
              : roleMeta.badgeStyle === "receptionist"
                ? styles.roleBadgeReceptionist
                : styles.roleBadgeAdmin
          ]}
        >
          <Text style={styles.roleBadgeText}>{roleMeta.label.toUpperCase()}</Text>
        </View>
        <Text style={styles.subtitle}>
          Signed in as {currentUser?.fullName}. Use the modules below that are available for your role.
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
          {summaryCards.map((card) => (
            <View key={card.key} style={styles.metricCard}>
              <Text style={styles.metricValue}>{card.value}</Text>
              <Text style={styles.metricLabel}>{card.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {canManageDoctors ? (
        <InfoCard
          title="Doctor Management"
          lines={[
            "View all doctors with quick search and specialization filtering.",
            "Add, edit, delete, and open detail views for every doctor record."
          ]}
        >
          <PrimaryButton title="Open Doctor Module" onPress={() => navigation.navigate("DoctorList")} />
        </InfoCard>
      ) : null}

      {canManageAppointments ? (
        <InfoCard
          title="Appointment Management"
          lines={[
            "Create and update appointments with patient, doctor, status, date, and time.",
            "Search by patient or doctor and filter by date or status."
          ]}
        >
          <PrimaryButton title="Open Appointment Module" onPress={() => navigation.navigate("AppointmentList")} />
        </InfoCard>
      ) : null}

      {canManageReports ? (
        <InfoCard
          title="Medical Reports"
          lines={[
            "Manage patient reports with diagnosis, symptoms, treatment, and notes.",
            "Search by patient name or report ID and filter by doctor or date."
          ]}
        >
          <PrimaryButton title="Open Medical Report Module" onPress={() => navigation.navigate("ReportList")} />
        </InfoCard>
      ) : null}

      {currentUser?.role === "admin" ? <PrimaryButton title="Refresh Data" onPress={resetDemoData} variant="ghost" /> : null}
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
  roleBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12
  },
  roleBadgePatient: {
    backgroundColor: "#2a7a4a"
  },
  roleBadgeReceptionist: {
    backgroundColor: "#5a4200"
  },
  roleBadgeAdmin: {
    backgroundColor: "#5b1d1d"
  },
  roleBadgeText: {
    color: "#f7fffd",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8
  },
  subtitle: {
    color: "#c3dbe0",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18
  },
  metricRow: {
    flexDirection: "row",
    gap: 10
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#1a4c57",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 92,
    justifyContent: "center"
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
