// Details screen for one appointment
import React, { useMemo } from "react";
import { Alert, StyleSheet, Text } from "react-native";

// Shared layout and components from the app
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function AppointmentDetailScreen({ navigation, route }) {
  // Get the saved appointments and the update function
  const { appointments, upsertAppointment } = useAppData();
  // Get current user info so we can check permissions
  const { currentUser } = useAuth();

  // Find the appointment we need to show from the appointmentId passed in route
  const appointment = useMemo(
    () => appointments.find((item) => item.rawId === route.params?.appointmentId),
    [appointments, route.params?.appointmentId]
  );

  // Decide what actions the current user can take
  const canManageAppointments = ["admin", "receptionist"].includes(currentUser?.role);
  const canCancelOwnAppointment = currentUser?.role === "patient" && appointment?.status !== "Cancelled";

  // If the appointment does not exist, show a simple message
  if (!appointment) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Appointment not found</Text>
        <PrimaryButton title="Back to Appointments" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Main page title */}
      <Text style={styles.title}>Appointment details</Text>

      {/* Show the appointment info in a card */}
      <InfoCard
        title={appointment.patientName}
        lines={[
          `Appointment ID: ${appointment.id}`,
          `Doctor: ${appointment.doctorName}`,
          `Date: ${appointment.date}`,
          `Time: ${appointment.time}`,
          `Reason: ${appointment.reason}`,
          `Status: ${appointment.status}`
        ]}
      />

      {/* Show edit button for admin or receptionist */}
      {canManageAppointments ? (
        <PrimaryButton
          title="Edit Appointment"
          onPress={() => navigation.navigate("AppointmentForm", { appointmentId: appointment.rawId })}
        />
      ) : null}

      {/* Patients can cancel their own appointment if it is not already cancelled */}
      {canCancelOwnAppointment ? (
        <PrimaryButton
          title="Cancel Appointment"
          onPress={async () => {
            try {
              await upsertAppointment({
                ...appointment,
                status: "Cancelled"
              });
              Alert.alert("Cancelled", "Your appointment was cancelled.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Cancel failed", error.message);
            }
          }}
          variant="ghost"
        />
      ) : null}

      {/* Button to go back to the appointment list */}
      <PrimaryButton title="Back to Appointments" onPress={() => navigation.goBack()} variant="ghost" />
    </ScreenContainer>
  );
}

// Simple styling for the screen title
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 12
  }
});
