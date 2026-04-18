import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function PatientListScreen({ navigation }) {
  const { patients, deletePatient } = useAppData();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const canManagePatients = ["admin", "receptionist"].includes(currentUser?.role);

  const filteredPatients = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return patients.filter((patient) => !normalizedQuery || patient.name.toLowerCase().includes(normalizedQuery));
  }, [patients, searchQuery]);

  const handleDelete = (patient) => {
    Alert.alert("Delete patient", `Delete ${patient.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePatient(patient.rawId);
          } catch (error) {
            Alert.alert("Delete failed", error.message);
          }
        }
      }
    ]);
  };

  if (!canManagePatients) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Access denied</Text>
        <Text style={styles.subtitle}>Only admin and receptionist roles can manage patient records.</Text>
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Patient Management</Text>
      <Text style={styles.subtitle}>View, search, add, edit, and remove patient records in one simple place.</Text>

      <View style={styles.panel}>
        <FormInput
          label="Search by patient name"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search patient"
        />
      </View>

      <PrimaryButton title="Add New Patient" onPress={() => navigation.navigate("PatientForm")} />

      {filteredPatients.map((patient) => (
        <InfoCard
          key={patient.id}
          title={`${patient.name} • ${patient.id}`}
          lines={[
            `Date of Birth: ${patient.dateOfBirth}`,
            `Gender: ${patient.gender}`,
            `Phone: ${patient.phone}`,
            `Email: ${patient.email}`,
            `Address: ${patient.address}`
          ]}
        >
          <PrimaryButton
            title="Edit Patient"
            onPress={() => navigation.navigate("PatientForm", { patientId: patient.rawId })}
            variant="secondary"
          />
          <PrimaryButton title="Delete Patient" onPress={() => handleDelete(patient)} variant="ghost" />
        </InfoCard>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 6
  },
  subtitle: {
    color: "#60757d",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16
  },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#dde8ee"
  }
});
