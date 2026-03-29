import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import AppointmentFormScreen from "./src/screens/AppointmentFormScreen";
import AppointmentHistoryScreen from "./src/screens/AppointmentHistoryScreen";

export default function App() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const handleAppointmentCreated = (message) => {
    setRefreshToken((current) => current + 1);
    setSuccessMessage(message || "Appointment created successfully.");
  };

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 6000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Clinic Appointments</Text>
          </View>
          <Text style={styles.title}>Clinic Appointment Management</Text>
          <Text style={styles.subtitle}>Manage bookings, schedule changes, and cancellations in one place.</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Today</Text>
              <Text style={styles.statValue}>Appointments</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>Active</Text>
            </View>
          </View>
        </View>
        {successMessage ? (
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Text style={styles.bannerIconText}>OK</Text>
            </View>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerTitle}>Updated</Text>
              <Text style={styles.bannerText}>{successMessage}</Text>
            </View>
          </View>
        ) : null}
        <View style={[styles.card, styles.primaryCard]}>
          <AppointmentFormScreen onAppointmentCreated={handleAppointmentCreated} />
        </View>
        <View style={[styles.card, styles.secondaryCard]}>
          <AppointmentHistoryScreen
            refreshToken={refreshToken}
            onAppointmentUpdated={setSuccessMessage}
            onAppointmentCancelled={setSuccessMessage}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef4fb"
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 18,
    paddingBottom: 40
  },
  hero: {
    backgroundColor: "#0f2747",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#0f2747",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#d7f3ec",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14
  },
  heroBadgeText: {
    color: "#156c5c",
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    color: "#f7fbff"
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#bfd1e5"
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18
  },
  statCard: {
    flex: 1,
    backgroundColor: "#16345d",
    borderRadius: 18,
    padding: 14
  },
  statLabel: {
    color: "#9db5d4",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase"
  },
  statValue: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700"
  },
  banner: {
    backgroundColor: "#e7f8ef",
    borderWidth: 1,
    borderColor: "#cdeedc",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#156c5c",
    alignItems: "center",
    justifyContent: "center"
  },
  bannerIconText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700"
  },
  bannerCopy: {
    flex: 1
  },
  bannerTitle: {
    color: "#156c5c",
    fontSize: 15,
    fontWeight: "700"
  },
  bannerText: {
    marginTop: 2,
    color: "#3f5f55",
    lineHeight: 20
  },
  card: {
    borderRadius: 28,
    padding: 18,
    shadowColor: "#18324d",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  primaryCard: {
    backgroundColor: "#ffffff"
  },
  secondaryCard: {
    backgroundColor: "#f8fbff"
  }
});
