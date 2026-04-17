import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["All", "Scheduled", "Completed", "Cancelled"];

export default function AppointmentListScreen({ navigation }) {
  const { appointments, deleteAppointment } = useAppData();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const canEditAppointments = ["admin", "receptionist"].includes(currentUser?.role);

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesQuery =
        !normalizedQuery ||
        appointment.patientName.toLowerCase().includes(normalizedQuery) ||
        appointment.doctorName.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "All" || appointment.status === statusFilter;
      const matchesDate = !dateFilter.trim() || appointment.date === dateFilter.trim();

      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  const handleDelete = (appointment) => {
    Alert.alert("Delete appointment", `Delete appointment ${appointment.id}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAppointment(appointment.id)
      }
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Appointment Management</Text>
      <Text style={styles.subtitle}>Track bookings, statuses, patient visits, and doctor schedules in one list.</Text>

      <View style={styles.panel}>
        <FormInput
          label="Search by patient or doctor"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search appointment"
        />
        <FormInput label="Filter by date" value={dateFilter} onChangeText={setDateFilter} placeholder="YYYY-MM-DD" />
        <Text style={styles.filterLabel}>Filter by status</Text>
        <View style={styles.filterWrap}>
          {STATUS_OPTIONS.map((option) => (
            <PrimaryButton
              key={option}
              title={option}
              onPress={() => setStatusFilter(option)}
              variant={statusFilter === option ? "primary" : "ghost"}
            />
          ))}
        </View>
      </View>

      {canEditAppointments ? (
        <PrimaryButton title="Create Appointment" onPress={() => navigation.navigate("AppointmentForm")} />
      ) : null}

      {filteredAppointments.map((appointment) => (
        <InfoCard
          key={appointment.id}
          title={`${appointment.patientName} • ${appointment.id}`}
          lines={[
            `Doctor: ${appointment.doctorName}`,
            `Date: ${appointment.date}`,
            `Time: ${appointment.time}`,
            `Reason: ${appointment.reason}`,
            `Status: ${appointment.status}`
          ]}
        >
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.statusBadge,
                appointment.status === "Completed" && styles.completedBadge,
                appointment.status === "Cancelled" && styles.cancelledBadge
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  appointment.status === "Completed" && styles.completedText,
                  appointment.status === "Cancelled" && styles.cancelledText
                ]}
              >
                {appointment.status}
              </Text>
            </View>
          </View>
          <PrimaryButton
            title="View Details"
            onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: appointment.id })}
          />
          {canEditAppointments ? (
            <PrimaryButton
              title="Edit Appointment"
              onPress={() => navigation.navigate("AppointmentForm", { appointmentId: appointment.id })}
              variant="secondary"
            />
          ) : null}
          {canEditAppointments ? (
            <PrimaryButton title="Delete Appointment" onPress={() => handleDelete(appointment)} variant="ghost" />
          ) : null}
        </InfoCard>
      ))}
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
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#4b6972",
    marginBottom: 10
  },
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  badgeRow: {
    marginBottom: 10
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#e0f2fe"
  },
  completedBadge: {
    backgroundColor: "#dcfce7"
  },
  cancelledBadge: {
    backgroundColor: "#fee2e2"
  },
  statusText: {
    color: "#0369a1",
    fontWeight: "700"
  },
  completedText: {
    color: "#15803d"
  },
  cancelledText: {
    color: "#b91c1c"
  }
});
