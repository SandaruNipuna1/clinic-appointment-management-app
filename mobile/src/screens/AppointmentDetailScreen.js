import React, { useMemo } from "react";
import { Alert, StyleSheet, Text } from "react-native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function AppointmentDetailScreen({ navigation, route }) {
  const { appointments, upsertAppointment } = useAppData();
  const { currentUser } = useAuth();
  const appointment = useMemo(
    () => appointments.find((item) => item.rawId === route.params?.appointmentId),
    [appointments, route.params?.appointmentId]
  );
  const canManageAppointments = ["admin", "receptionist"].includes(currentUser?.role);
  const canCancelOwnAppointment = currentUser?.role === "patient" && appointment?.status !== "Cancelled";

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
      <Text style={styles.title}>Appointment details</Text>
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
      {canManageAppointments ? (
        <PrimaryButton
          title="Edit Appointment"
          onPress={() => navigation.navigate("AppointmentForm", { appointmentId: appointment.rawId })}
        />
      ) : null}
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
      <PrimaryButton title="Back to Appointments" onPress={() => navigation.goBack()} variant="ghost" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 12
  }
});
