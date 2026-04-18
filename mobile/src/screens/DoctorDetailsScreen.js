import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function DoctorDetailsScreen({ navigation, route }) {
  const { doctors } = useAppData();
  const { currentUser } = useAuth();
  const doctor = useMemo(() => doctors.find((item) => item.rawId === route.params?.doctorId), [doctors, route.params?.doctorId]);
  const canEditDoctors = ["admin", "receptionist"].includes(currentUser?.role);

  if (!doctor) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Doctor not found</Text>
        <PrimaryButton title="Back to Doctors" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Doctor details</Text>
      <InfoCard
        title={doctor.name}
        lines={[
          `Doctor ID: ${doctor.id}`,
          `Specialization: ${doctor.specialization}`,
          `Phone: ${doctor.phone}`,
          `Email: ${doctor.email}`,
          `Availability: ${doctor.availability}`,
          `Room: ${doctor.roomNumber || "-"}`
        ]}
      >
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Room</Text>
            <Text style={styles.badgeValue}>{doctor.roomNumber || "TBA"}</Text>
          </View>
        </View>
      </InfoCard>
      {canEditDoctors ? (
        <PrimaryButton title="Edit Doctor" onPress={() => navigation.navigate("DoctorForm", { doctorId: doctor.rawId })} />
      ) : null}
      <PrimaryButton title="Back to Doctors" onPress={() => navigation.goBack()} variant="ghost" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 12
  },
  badgeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10
  },
  badge: {
    flex: 1,
    backgroundColor: "#f2f8f9",
    borderRadius: 18,
    padding: 14
  },
  badgeLabel: {
    color: "#68818a",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6
  },
  badgeValue: {
    color: "#193944",
    fontWeight: "700"
  }
});
