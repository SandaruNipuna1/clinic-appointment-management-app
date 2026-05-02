// Tools from React and React Native
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

// Custom parts for the app
import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";

// Bring in data and user info
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["All", "Scheduled", "Completed", "Cancelled"];

// List of appointments screen
export default function AppointmentListScreen({ navigation }) {

  const { appointments, upsertAppointment, deleteAppointment } = useAppData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Who can manage appointments
  const canManageAppointments = ["admin", "receptionist"].includes(currentUser?.role);
  const canCreateAppointment = ["admin", "receptionist", "patient"].includes(currentUser?.role);
  const canCancelOwnAppointment = currentUser?.role === "patient";

  // Creates a filtered list of appointments based on search, status, and date
  const filteredAppointments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    //Matching
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

  // Deleting an appointment
  const handleDelete = (appointment) => {
    // Delete alert
    Alert.alert("Delete appointment", `Delete appointment ${appointment.id}?`, [
      { text: "Cancel", style: "cancel" }, // Cancel the delete button
      {
        text: "Delete", // Confirm delete button
        style: "destructive", // Makes it look dangerous
        onPress: async () => {
          try {
            await deleteAppointment(appointment.rawId);
          } catch (error) {
            Alert.alert("Delete failed", error.message);
          }
        }
      }
    ]);
  };

  // Screen
  return (
    // Wrap everything in a container
    <ScreenContainer>
      {/* Main title*/}
      <Text style={styles.title}>Appointment Management</Text>
      {/* Short description */}
      <Text style={styles.subtitle}>Track bookings, statuses, patient visits, and doctor schedules in one list.</Text>

      {/* Search and filter panel */}
      <View style={styles.panel}>
        <FormInput
          label="Search by patient or doctor"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search appointment"
        />
        {}
        <FormInput label="Filter by date" value={dateFilter} onChangeText={setDateFilter} placeholder="YYYY-MM-DD" />
        {}
        <Text style={styles.filterLabel}>Filter by status</Text>
        {/* Row of buttons for status filters */}
        <View style={styles.filterWrap}>
          {/* Create a button for each status option */}
          {STATUS_OPTIONS.map((option) => (
            <PrimaryButton
              key={option} // Unique key for each button
              title={option} // Text on the button
              onPress={() => setStatusFilter(option)} // What happens when pressed
              variant={statusFilter === option ? "primary" : "ghost"} // How it looks based on selection
            />
          ))}
        </View>
      </View>

      {/* Create a new appointment button*/}
      {canCreateAppointment ? (
        <PrimaryButton title="Create Appointment" onPress={() => navigation.navigate("AppointmentForm")} />
      ) : null}

      {/* List each filtered appointment */}
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
          {/* Row for the status badge */}
          <View style={styles.badgeRow}>
            {}
            <View
              style={[
                styles.statusBadge, // Base style
                appointment.status === "Completed" && styles.completedBadge, // Green if completed
                appointment.status === "Cancelled" && styles.cancelledBadge // Red if cancelled
              ]}
            >
              {/* Text inside the badge */}
              <Text
                style={[
                  styles.statusText, // Base text style
                  appointment.status === "Completed" && styles.completedText, // Green text if completed
                  appointment.status === "Cancelled" && styles.cancelledText // Red text if cancelled
                ]}
              >
                {appointment.status} {/* The status word */}
              </Text>
            </View>
          </View>
          {/* Button to view more details */}
          <PrimaryButton
            title="View Details"
            onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: appointment.rawId })}
          />
          {/* Button to edit, only if allowed */}
          {canManageAppointments ? (
            <PrimaryButton
              title="Edit Appointment"
              onPress={() => navigation.navigate("AppointmentForm", { appointmentId: appointment.rawId })}
              variant="secondary"
            />
          ) : null}
          {/* Button to delete, only if allowed */}
          {canManageAppointments ? (
            <PrimaryButton title="Delete Appointment" onPress={() => handleDelete(appointment)} variant="ghost" />
          ) : null}
          {/* Button for patients to cancel their own appointment */}
          {canCancelOwnAppointment && appointment.status !== "Cancelled" ? (
            <PrimaryButton
              title="Cancel Appointment"
              onPress={async () => {
                try {
                  // Try to update the appointment status to cancelled
                  await upsertAppointment({
                    ...appointment,
                    status: "Cancelled"
                  });
                } catch (error) {
                  // Error message
                  Alert.alert("Cancel failed", error.message);
                }
              }}
              variant="ghost"
            />
          ) : null}
        </InfoCard>
      ))}
    </ScreenContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  // Style for the main title
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 6
  },
  // Style for the subtitle
  subtitle: {
    color: "#60757d",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16
  },
  // Style for the filter panel
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#dde8ee"
  },
  // Style for the filter label
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#4b6972",
    marginBottom: 10
  },
  // Style for wrapping the filter buttons
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  // Style for the row holding the status badge
  badgeRow: {
    marginBottom: 10
  },
  // Base style for the status badge
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#e0f2fe"
  },
  // Style for completed badge (green background)
  completedBadge: {
    backgroundColor: "#dcfce7"
  },
  // Style for cancelled badge (red background)
  cancelledBadge: {
    backgroundColor: "#fee2e2"
  },
  // Base style for status text
  statusText: {
    color: "#0369a1",
    fontWeight: "700"
  },
  // Style for completed text (green)
  completedText: {
    color: "#15803d"
  },
  // Style for cancelled text (red)
  cancelledText: {
    color: "#b91c1c"
  }
});
