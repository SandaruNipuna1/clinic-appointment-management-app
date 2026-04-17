import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Doctor Directory</Text>
        <Text style={styles.heroTitle}>People behind the clinic</Text>
        <Text style={styles.heroText}>
          Review active doctors, check specialties, and keep weekly schedules tidy before appointments are booked.
        </Text>
        <View style={styles.metricBand}>
          <Text style={styles.metricValue}>{doctors.length}</Text>
          <Text style={styles.metricLabel}>Active doctors available</Text>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actionRow}>
        <PrimaryButton title="Refresh Doctors" onPress={loadDoctors} loading={loading} />
        {session.role === "admin" ? (
          <PrimaryButton
            title="Add New Doctor"
            onPress={() => navigation.navigate("DoctorForm", { mode: "create" })}
            variant="secondary"
          />
        ) : null}
        <PrimaryButton
          title={session.role === "admin" ? "Back To Dashboard" : "Back To History"}
          onPress={() => navigation.navigate(session.role === "admin" ? "AdminMedicalRecords" : "PatientHistory")}
          variant="ghost"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Directory list</Text>
        <Text style={styles.sectionCaption}>Each card includes direct access to detail and admin actions.</Text>
      </View>

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

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#f7fffd",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#cfe9e3"
  },
  heroEyebrow: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "800",
    color: "#11323d",
    marginBottom: 10
  },
  heroText: {
    color: "#56707a",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16
  },
  metricBand: {
    backgroundColor: "#123b46",
    borderRadius: 20,
    padding: 16
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4
  },
  metricLabel: {
    color: "#c7dde0",
    fontSize: 13
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 12
  },
  actionRow: {
    marginBottom: 18
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 4
  },
  sectionCaption: {
    color: "#60757d",
    fontSize: 14
  }
});
