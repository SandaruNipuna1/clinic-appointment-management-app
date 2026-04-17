import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useSession } from "../context/SessionContext";
import { moduleApi } from "../api/moduleApi";

export default function DoctorDetailScreen({ navigation, route }) {
  const { session } = useSession();
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState("");

  const loadDoctor = async () => {
    try {
      setError("");
      const doctorData = await moduleApi.getDoctorById({
        baseUrl: session.apiBaseUrl,
        token: session.token,
        doctorId
      });
      setDoctor(doctorData);
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDoctor();
    }, [doctorId])
  );

  return (
    <ScreenContainer>
      <Text style={styles.screenTitle}>Doctor details</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {doctor ? (
        <InfoCard title={doctor.name} lines={[`Specialization: ${doctor.specialization}`, `Email: ${doctor.email}`]}>
          <View style={styles.dataGrid}>
            <View style={styles.dataChip}>
              <Text style={styles.dataLabel}>Phone</Text>
              <Text style={styles.dataValue}>{doctor.phone}</Text>
            </View>
            <View style={styles.dataChip}>
              <Text style={styles.dataLabel}>Experience</Text>
              <Text style={styles.dataValue}>{doctor.experience || 0} years</Text>
            </View>
          </View>
          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>Professional bio</Text>
            <Text style={styles.bioText}>{doctor.bio || "No biography added yet."}</Text>
          </View>
          <Text style={styles.availabilityTitle}>Availability</Text>
          {doctor.availability?.length ? (
            doctor.availability.map((slot, index) => (
              <View key={`${doctor._id}-slot-${index}`} style={styles.slotRow}>
                <Text style={styles.slotDay}>{slot.day}</Text>
                <Text style={styles.slotTime}>
                  {slot.startTime} - {slot.endTime}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No availability configured.</Text>
          )}
          {session.role === "admin" ? (
            <PrimaryButton
              title="Edit Doctor"
              onPress={() => navigation.navigate("DoctorForm", { mode: "edit", doctor })}
              variant="secondary"
            />
          ) : null}
        </InfoCard>
      ) : (
        <Text style={styles.loadingText}>Loading doctor profile...</Text>
      )}

      <PrimaryButton
        title={session.role === "admin" ? "Back To Doctors" : "Back To History"}
        onPress={() => navigation.goBack()}
        variant="secondary"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 12
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 12
  },
  dataGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14
  },
  dataChip: {
    flex: 1,
    backgroundColor: "#f2f8f9",
    borderRadius: 16,
    padding: 12
  },
  dataLabel: {
    color: "#64808a",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6
  },
  dataValue: {
    color: "#16333d",
    fontSize: 15,
    fontWeight: "700"
  },
  bioCard: {
    backgroundColor: "#fffaf0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14
  },
  bioLabel: {
    color: "#9a6700",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6
  },
  bioText: {
    color: "#53636b",
    lineHeight: 21
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 10
  },
  slotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f5"
  },
  slotDay: {
    color: "#1f4450",
    fontWeight: "700"
  },
  slotTime: {
    color: "#58707a"
  },
  emptyText: {
    color: "#64748b",
    marginBottom: 10
  },
  loadingText: {
    color: "#475569"
  }
});
