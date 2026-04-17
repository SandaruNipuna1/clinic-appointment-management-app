import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";

export default function AppointmentDetailScreen({ navigation, route }) {
  const { appointments } = useAppData();
  const appointment = useMemo(
    () => appointments.find((item) => item.rawId === route.params?.appointmentId),
    [appointments, route.params?.appointmentId]
  );

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
      <PrimaryButton
        title="Edit Appointment"
        onPress={() => navigation.navigate("AppointmentForm", { appointmentId: appointment.rawId })}
      />
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
