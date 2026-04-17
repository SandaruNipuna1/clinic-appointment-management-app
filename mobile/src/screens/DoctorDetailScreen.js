import React, { useCallback, useState } from "react";
import { Text } from "react-native";
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
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Doctor details</Text>

      {error ? <Text style={{ color: "#dc2626", marginBottom: 12 }}>{error}</Text> : null}

      {doctor ? (
        <InfoCard
          title={doctor.name}
          lines={[
            `Specialization: ${doctor.specialization}`,
            `Email: ${doctor.email}`,
            `Phone: ${doctor.phone}`,
            `Experience: ${doctor.experience || 0} years`,
            `Bio: ${doctor.bio || "-"}`
          ]}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", marginTop: 10, marginBottom: 8 }}>Availability</Text>
          {doctor.availability?.length ? (
            doctor.availability.map((slot, index) => (
              <Text key={`${doctor._id}-slot-${index}`} style={{ color: "#334155", marginBottom: 4 }}>
                {slot.day}: {slot.startTime} - {slot.endTime}
              </Text>
            ))
          ) : (
            <Text style={{ color: "#64748b", marginBottom: 8 }}>No availability configured.</Text>
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
        <Text style={{ color: "#475569" }}>Loading doctor profile...</Text>
      )}

      <PrimaryButton
        title={session.role === "admin" ? "Back To Doctors" : "Back To History"}
        onPress={() => navigation.goBack()}
        variant="secondary"
      />
    </ScreenContainer>
  );
}
