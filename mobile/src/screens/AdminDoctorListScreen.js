import React, { useCallback, useState } from "react";
import { Alert, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useSession } from "../context/SessionContext";
import { moduleApi } from "../api/moduleApi";

export default function AdminDoctorListScreen({ navigation }) {
  const { session } = useSession();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError("");
      const doctorData = await moduleApi.getDoctors({
        baseUrl: session.apiBaseUrl,
        token: session.token
      });
      setDoctors(doctorData);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDoctors();
    }, [])
  );

  const handleDeleteDoctor = (doctorId, doctorName) => {
    Alert.alert("Delete doctor", `Remove ${doctorName} from the active doctor list?`, [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await moduleApi.deleteDoctor({
              baseUrl: session.apiBaseUrl,
              token: session.token,
              doctorId
            });
            await loadDoctors();
          } catch (apiError) {
            Alert.alert("Delete failed", apiError.message);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Doctor management</Text>
      <Text style={{ color: "#475569", marginBottom: 16 }}>
        Add doctors, review availability, and maintain the active directory used across the clinic app.
      </Text>

      {error ? <Text style={{ color: "#dc2626", marginBottom: 12 }}>{error}</Text> : null}

      <PrimaryButton title="Refresh Doctors" onPress={loadDoctors} loading={loading} />
      {session.role === "admin" ? (
        <PrimaryButton
          title="Add New Doctor"
          onPress={() => navigation.navigate("DoctorForm", { mode: "create" })}
          variant="secondary"
        />
      ) : null}
      <PrimaryButton
        title={session.role === "admin" ? "Back To Admin Dashboard" : "Back To History"}
        onPress={() => navigation.navigate(session.role === "admin" ? "AdminMedicalRecords" : "PatientHistory")}
        variant="secondary"
      />

      {doctors.map((doctor) => (
        <InfoCard
          key={doctor._id}
          title={doctor.name}
          lines={[
            `Specialization: ${doctor.specialization}`,
            `Email: ${doctor.email}`,
            `Phone: ${doctor.phone}`,
            `Experience: ${doctor.experience || 0} years`,
            doctor.availability?.length
              ? `Availability: ${doctor.availability.map((slot) => `${slot.day} ${slot.startTime}-${slot.endTime}`).join(", ")}`
              : "Availability: Not set"
          ]}
        >
          <PrimaryButton
            title="View Doctor"
            onPress={() => navigation.navigate("DoctorDetail", { doctorId: doctor._id })}
            variant="secondary"
          />
          {session.role === "admin" ? (
            <PrimaryButton
              title="Edit Doctor"
              onPress={() => navigation.navigate("DoctorForm", { mode: "edit", doctor })}
              variant="secondary"
            />
          ) : null}
          {session.role === "admin" ? (
            <PrimaryButton title="Delete Doctor" onPress={() => handleDeleteDoctor(doctor._id, doctor.name)} />
          ) : null}
        </InfoCard>
      ))}
    </ScreenContainer>
  );
}
