// This file brings in tools from React and React Native to build the screen
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

// These are custom parts made for this app, like input boxes and buttons
import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";

// These bring in data and user info from the app's storage
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

// This is a list of options for filtering appointments by their status
const STATUS_OPTIONS = ["All", "Scheduled", "Completed", "Cancelled"];

// This is the main part of the screen, showing a list of appointments
export default function AppointmentListScreen({ navigation }) {
  // Get appointment data and functions to change them from the app's data store
  const { appointments, upsertAppointment, deleteAppointment } = useAppData();
  // Get info about the current logged-in user
  const { currentUser } = useAuth();

  // This keeps track of what the user types in the search box
  const [searchQuery, setSearchQuery] = useState("");
  // This keeps track of which status filter is selected
  const [statusFilter, setStatusFilter] = useState("All");
  // This keeps track of the date filter
  const [dateFilter, setDateFilter] = useState("");

  // Check if the user can manage appointments (like admins or receptionists)
  const canManageAppointments = ["admin", "receptionist"].includes(currentUser?.role);
  // Check if the user can create new appointments
  const canCreateAppointment = ["admin", "receptionist", "patient"].includes(currentUser?.role);
  // Check if the user is a patient who can cancel their own appointments
  const canCancelOwnAppointment = currentUser?.role === "patient";

  // This creates a filtered list of appointments based on search, status, and date
  // It updates automatically when the filters change
  const filteredAppointments = useMemo(() => {
    // Make the search text lowercase and remove extra spaces
    const normalizedQuery = searchQuery.trim().toLowerCase();

    // Go through each appointment and see if it matches the filters
    return appointments.filter((appointment) => {
      // Check if the search matches the patient or doctor name
      const matchesQuery =
        !normalizedQuery ||
        appointment.patientName.toLowerCase().includes(normalizedQuery) ||
        appointment.doctorName.toLowerCase().includes(normalizedQuery);
      // Check if the status matches the filter
      const matchesStatus = statusFilter === "All" || appointment.status === statusFilter;
      // Check if the date matches the filter
      const matchesDate = !dateFilter.trim() || appointment.date === dateFilter.trim();

      // Only keep appointments that match all filters
      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  // This function handles deleting an appointment, with a confirmation popup
  const handleDelete = (appointment) => {
    // Show a popup asking if they really want to delete
    Alert.alert("Delete appointment", `Delete appointment ${appointment.id}?`, [
      { text: "Cancel", style: "cancel" }, // Button to cancel the delete
      {
        text: "Delete", // Button to confirm delete
        style: "destructive", // Makes it look dangerous
        onPress: async () => { // What happens when they press delete
          try {
            // Try to delete the appointment from the server
            await deleteAppointment(appointment.rawId);
          } catch (error) {
            // If it fails, show an error message
            Alert.alert("Delete failed", error.message);
          }
        }
      }
    ]);
  };

  // This is what the screen looks like and how it works
  return (
    // Wrap everything in a container that handles the screen layout
    <ScreenContainer>
      {/* The main title of the screen */}
      <Text style={styles.title}>Appointment Management</Text>
      {/* A short description under the title */}
      <Text style={styles.subtitle}>Track bookings, statuses, patient visits, and doctor schedules in one list.</Text>

      {/* A panel for the search and filter options */}
      <View style={styles.panel}>
        {/* Input box for searching by patient or doctor name */}
        <FormInput
          label="Search by patient or doctor"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search appointment"
        />
        {/* Input box for filtering by date */}
        <FormInput label="Filter by date" value={dateFilter} onChangeText={setDateFilter} placeholder="YYYY-MM-DD" />
        {/* Label for the status filter buttons */}
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

      {/* Button to create a new appointment, only if allowed */}
      {canCreateAppointment ? (
        <PrimaryButton title="Create Appointment" onPress={() => navigation.navigate("AppointmentForm")} />
      ) : null}

      {/* List each filtered appointment */}
      {filteredAppointments.map((appointment) => (
        // Card showing details of the appointment
        <InfoCard
          key={appointment.id} // Unique key for each card
          title={`${appointment.patientName} • ${appointment.id}`} // Title with patient name and ID
          lines={[ // List of details to show
            `Doctor: ${appointment.doctorName}`,
            `Date: ${appointment.date}`,
            `Time: ${appointment.time}`,
            `Reason: ${appointment.reason}`,
            `Status: ${appointment.status}`
          ]}
        >
          {/* Row for the status badge */}
          <View style={styles.badgeRow}>
            {/* Badge showing the appointment status with color */}
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
                  // If it fails, show an error message
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

// These are the styles that make the screen look nice
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
