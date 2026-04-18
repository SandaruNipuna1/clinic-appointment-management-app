import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const validatePatient = (values, patients, currentId) => {
  const errors = {};

  ["name", "dateOfBirth", "gender", "phone", "email", "address"].forEach((field) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = `${field} is required`;
    }
  });

  if (values.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(values.dateOfBirth.trim())) {
    errors.dateOfBirth = "dateOfBirth must use YYYY-MM-DD format";
  }

  const duplicateEmail = patients.find(
    (patient) => patient.email.toLowerCase() === values.email.trim().toLowerCase() && patient.id !== currentId
  );

  if (duplicateEmail) {
    errors.email = "email must be unique";
  }

  return errors;
};

export default function PatientFormScreen({ navigation, route }) {
  const { patients, upsertPatient } = useAppData();
  const { currentUser } = useAuth();
  const patientId = route.params?.patientId;
  const existingPatient = useMemo(() => patients.find((patient) => patient.rawId === patientId), [patients, patientId]);
  const [values, setValues] = useState({
    name: existingPatient?.name || "",
    dateOfBirth: existingPatient?.dateOfBirth || "",
    gender: existingPatient?.gender || "Male",
    phone: existingPatient?.phone || "",
    email: existingPatient?.email || "",
    address: existingPatient?.address || ""
  });
  const [errors, setErrors] = useState({});

  const canManagePatients = ["admin", "receptionist"].includes(currentUser?.role);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const nextErrors = validatePatient(values, patients, existingPatient?.id);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await upsertPatient({
        ...values,
        rawId: existingPatient?.rawId
      });

      Alert.alert("Saved", existingPatient ? "Patient updated." : "Patient added successfully.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error.message);
    }
  };

  if (!canManagePatients) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Access denied</Text>
        <Text style={styles.subtitle}>Only admin and receptionist roles can add or edit patient records.</Text>
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{existingPatient ? "Edit patient" : "Add patient"}</Text>
      <Text style={styles.subtitle}>Fill in the patient details. The patient ID is generated automatically by the system.</Text>

      <View style={styles.panel}>
        {existingPatient ? (
          <FormInput label="Patient ID" value={existingPatient.id} onChangeText={() => {}} editable={false} />
        ) : (
          <FormInput label="Patient ID" value="Auto-generated after save" onChangeText={() => {}} editable={false} />
        )}
        <FormInput label="Patient Name" value={values.name} onChangeText={(value) => handleChange("name", value)} error={errors.name} />
        <FormInput
          label="Date of Birth"
          value={values.dateOfBirth}
          onChangeText={(value) => handleChange("dateOfBirth", value)}
          error={errors.dateOfBirth}
          placeholder="2002-05-14"
        />

        <Text style={styles.filterLabel}>Gender</Text>
        <View style={styles.filterWrap}>
          {GENDER_OPTIONS.map((option) => (
            <PrimaryButton
              key={option}
              title={option}
              onPress={() => handleChange("gender", option)}
              variant={values.gender === option ? "primary" : "ghost"}
            />
          ))}
        </View>
        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

        <FormInput label="Phone" value={values.phone} onChangeText={(value) => handleChange("phone", value)} error={errors.phone} />
        <FormInput label="Email" value={values.email} onChangeText={(value) => handleChange("email", value)} error={errors.email} />
        <FormInput
          label="Address"
          value={values.address}
          onChangeText={(value) => handleChange("address", value)}
          error={errors.address}
          multiline
        />
      </View>

      <PrimaryButton title={existingPatient ? "Update Patient" : "Save Patient"} onPress={handleSave} />
      <PrimaryButton title="Cancel" onPress={() => navigation.goBack()} variant="ghost" />
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
    gap: 10,
    marginBottom: 10
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 10
  }
});
