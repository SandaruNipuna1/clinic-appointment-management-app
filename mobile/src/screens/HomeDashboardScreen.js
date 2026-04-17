import React from "react";
import { StyleSheet, Text, View } from "react-native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";

export default function HomeDashboardScreen({ navigation }) {
  const { doctors, appointments, reports, resetDemoData } = useAppData();

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Clinic Frontend Demo</Text>
        <Text style={styles.title}>Integrated clinic management workspace</Text>
        <Text style={styles.subtitle}>
          Explore Doctor Management, Appointment Management, and Medical Reports in one polished frontend demo.
        </Text>
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{doctors.length}</Text>
            <Text style={styles.metricLabel}>Doctors</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{appointments.length}</Text>
            <Text style={styles.metricLabel}>Appointments</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{reports.length}</Text>
            <Text style={styles.metricLabel}>Reports</Text>
          </View>
        </View>
      </View>

      <InfoCard
        title="Doctor Management"
        lines={[
          "View all doctors with quick search and specialization filtering.",
          "Add, edit, delete, and open detail views for every doctor record."
        ]}
      >
        <PrimaryButton title="Open Doctor Module" onPress={() => navigation.navigate("DoctorList")} />
      </InfoCard>

      <InfoCard
        title="Appointment Management"
        lines={[
          "Create and update appointments with patient, doctor, status, date, and time.",
          "Search by patient or doctor and filter by date or status."
        ]}
      >
        <PrimaryButton title="Open Appointment Module" onPress={() => navigation.navigate("AppointmentList")} />
      </InfoCard>

      <InfoCard
        title="Medical Reports"
        lines={[
          "Manage patient reports with diagnosis, symptoms, treatment, and notes.",
          "Search by patient name or report ID and filter by doctor or date."
        ]}
      >
        <PrimaryButton title="Open Medical Report Module" onPress={() => navigation.navigate("ReportList")} />
      </InfoCard>

      <PrimaryButton title="Reset Demo Data" onPress={resetDemoData} variant="ghost" />
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
    gap: 10
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#1a4c57",
    borderRadius: 18,
    padding: 12
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800"
  },
  metricLabel: {
    color: "#c2dde1",
    marginTop: 4,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8
  }
});
