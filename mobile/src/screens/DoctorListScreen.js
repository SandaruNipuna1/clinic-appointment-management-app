import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";

const SPECIALIZATION_OPTIONS = ["All", "Cardiology", "Pediatrics", "Dermatology", "Neurology", "General Medicine"];

export default function DoctorListScreen({ navigation }) {
  const { doctors, deleteDoctor } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesQuery =
        !normalizedQuery ||
        doctor.name.toLowerCase().includes(normalizedQuery) ||
        doctor.id.toLowerCase().includes(normalizedQuery);
      const matchesSpecialization =
        specializationFilter === "All" || doctor.specialization === specializationFilter;

      return matchesQuery && matchesSpecialization;
    });
  }, [doctors, searchQuery, specializationFilter]);

  const handleDelete = (doctor) => {
    Alert.alert("Delete doctor", `Delete ${doctor.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteDoctor(doctor.id)
      }
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Doctor Management</Text>
      <Text style={styles.subtitle}>Search, filter, and manage all doctors from one clean directory.</Text>

      <View style={styles.panel}>
        <FormInput
          label="Search by name or ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search doctor by name"
        />
        <Text style={styles.filterLabel}>Filter by specialization</Text>
        <View style={styles.filterWrap}>
          {SPECIALIZATION_OPTIONS.map((option) => (
            <PrimaryButton
              key={option}
              title={option}
              onPress={() => setSpecializationFilter(option)}
              variant={specializationFilter === option ? "primary" : "ghost"}
            />
          ))}
        </View>
      </View>

      <PrimaryButton title="Add New Doctor" onPress={() => navigation.navigate("DoctorForm")} />

      {filteredDoctors.map((doctor) => (
        <InfoCard
          key={doctor.id}
          title={`${doctor.name} • ${doctor.id}`}
          lines={[
            `Specialization: ${doctor.specialization}`,
            `Phone: ${doctor.phone}`,
            `Email: ${doctor.email}`,
            `Availability: ${doctor.availability}`,
            `Location: ${doctor.roomNumber || doctor.department || "-"}`
          ]}
        >
          <PrimaryButton title="View Details" onPress={() => navigation.navigate("DoctorDetail", { doctorId: doctor.id })} />
          <PrimaryButton
            title="Edit Doctor"
            onPress={() => navigation.navigate("DoctorForm", { doctorId: doctor.id })}
            variant="secondary"
          />
          <PrimaryButton title="Delete Doctor" onPress={() => handleDelete(doctor)} variant="ghost" />
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
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#4b6972",
    marginBottom: 10
  },
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  }
});
