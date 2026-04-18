import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const SPECIALIZATION_OPTIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Orthopedic",
  "ENT Specialist",
  "Gynecologist",
  "Pediatrician",
  "Dentist",
  "Neurologist",
  "Psychiatrist"
];

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const validateDoctor = (values, doctors, currentId) => {
  const errors = {};

  ["name", "specialization", "phone", "email", "availabilityDay", "availabilityStartTime", "availabilityEndTime"].forEach((field) => {
    if (!values[field].trim()) {
      errors[field] = `${field} is required`;
    }
  });

  const duplicateEmail = doctors.find(
    (doctor) => doctor.email.toLowerCase() === values.email.trim().toLowerCase() && doctor.id !== currentId
  );

  if (duplicateEmail) {
    errors.email = "email must be unique";
  }

  return errors;
};

export default function DoctorManagementFormScreen({ navigation, route }) {
  const { doctors, upsertDoctor } = useAppData();
  const { currentUser } = useAuth();
  const doctorId = route.params?.doctorId;
  const existingDoctor = useMemo(() => doctors.find((doctor) => doctor.rawId === doctorId), [doctors, doctorId]);
  const [values, setValues] = useState({
    id: existingDoctor?.id || "",
    name: existingDoctor?.name || "",
    specialization: existingDoctor?.specialization || "",
    phone: existingDoctor?.phone || "",
    email: existingDoctor?.email || "",
    availabilityDay: existingDoctor?.availabilityDay || "",
    availabilityStartTime: existingDoctor?.availabilityStartTime || "",
    availabilityEndTime: existingDoctor?.availabilityEndTime || "",
    roomNumber: existingDoctor?.roomNumber || "",
  });
  const [errors, setErrors] = useState({});
  const [showSpecializations, setShowSpecializations] = useState(false);
  const [showDays, setShowDays] = useState(false);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const nextErrors = validateDoctor(values, doctors, existingDoctor?.id);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await upsertDoctor({
        ...values,
        rawId: existingDoctor?.rawId,
        name: values.name.trim(),
        specialization: values.specialization.trim(),
        phone: values.phone.trim(),
        email: values.email.trim().toLowerCase(),
        availabilityDay: values.availabilityDay.trim(),
        availabilityStartTime: values.availabilityStartTime.trim(),
        availabilityEndTime: values.availabilityEndTime.trim(),
        roomNumber: values.roomNumber.trim(),
      });

      Alert.alert("Saved", existingDoctor ? "Doctor details updated." : "Doctor added successfully.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error.message);
    }
  };

  if (!["admin", "receptionist"].includes(currentUser?.role)) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Access denied</Text>
        <Text style={styles.subtitle}>Your role does not have permission to add or edit doctor records.</Text>
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{existingDoctor ? "Edit doctor" : "Add doctor"}</Text>
      <Text style={styles.subtitle}>Fill in the required doctor details and keep availability easy to read.</Text>

      <View style={styles.panel}>
        {existingDoctor ? (
          <FormInput label="Doctor ID" value={existingDoctor.id} onChangeText={() => {}} editable={false} />
        ) : null}
        <FormInput label="Name" value={values.name} onChangeText={(value) => handleChange("name", value)} error={errors.name} />
        <Text style={styles.filterLabel}>Specialization</Text>
        <Pressable style={styles.selectorField} onPress={() => setShowSpecializations((current) => !current)}>
          <Text style={values.specialization ? styles.selectorValue : styles.selectorPlaceholder}>
            {values.specialization || "Select specialization"}
          </Text>
        </Pressable>
        {showSpecializations ? (
          <View style={styles.optionGrid}>
            {SPECIALIZATION_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={[styles.optionChip, values.specialization === option && styles.optionChipSelected]}
                onPress={() => {
                  handleChange("specialization", option);
                  setShowSpecializations(false);
                }}
              >
                <Text style={[styles.optionChipText, values.specialization === option && styles.optionChipTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {errors.specialization ? <Text style={styles.errorText}>{errors.specialization}</Text> : null}
        <FormInput label="Phone Number" value={values.phone} onChangeText={(value) => handleChange("phone", value)} error={errors.phone} />
        <FormInput label="Email" value={values.email} onChangeText={(value) => handleChange("email", value)} error={errors.email} />
        <Text style={styles.filterLabel}>Available Day</Text>
        <Pressable style={styles.selectorField} onPress={() => setShowDays((current) => !current)}>
          <Text style={values.availabilityDay ? styles.selectorValue : styles.selectorPlaceholder}>
            {values.availabilityDay || "Select available day"}
          </Text>
        </Pressable>
        {showDays ? (
          <View style={styles.optionGrid}>
            {DAY_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={[styles.optionChip, values.availabilityDay === option && styles.optionChipSelected]}
                onPress={() => {
                  handleChange("availabilityDay", option);
                  setShowDays(false);
                }}
              >
                <Text style={[styles.optionChipText, values.availabilityDay === option && styles.optionChipTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {errors.availabilityDay ? <Text style={styles.errorText}>{errors.availabilityDay}</Text> : null}
        <FormInput
          label="Start Time"
          value={values.availabilityStartTime}
          onChangeText={(value) => handleChange("availabilityStartTime", value)}
          error={errors.availabilityStartTime}
          placeholder="09:00"
        />
        <FormInput
          label="End Time"
          value={values.availabilityEndTime}
          onChangeText={(value) => handleChange("availabilityEndTime", value)}
          error={errors.availabilityEndTime}
          placeholder="16:00"
        />
        <FormInput
          label="Room Number"
          value={values.roomNumber}
          onChangeText={(value) => handleChange("roomNumber", value)}
          placeholder="Room 12"
        />
      </View>

      <PrimaryButton title={existingDoctor ? "Update Doctor" : "Save Doctor"} onPress={handleSave} />
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
  selectorField: {
    borderWidth: 1,
    borderColor: "#d3dee5",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    marginBottom: 10
  },
  selectorValue: {
    fontSize: 16,
    color: "#12303a",
    fontWeight: "600"
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: "#8aa0ad"
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12
  },
  optionChip: {
    borderWidth: 1,
    borderColor: "#d3dee5",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#ffffff"
  },
  optionChipSelected: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e"
  },
  optionChipText: {
    color: "#29444b",
    fontWeight: "700",
    fontSize: 14
  },
  optionChipTextSelected: {
    color: "#ffffff"
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 10
  }
});
