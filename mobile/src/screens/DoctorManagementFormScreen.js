import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";

const validateDoctor = (values, doctors, currentId) => {
  const errors = {};

  ["name", "specialization", "phone", "email", "availability"].forEach((field) => {
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
  const doctorId = route.params?.doctorId;
  const existingDoctor = useMemo(() => doctors.find((doctor) => doctor.id === doctorId), [doctors, doctorId]);
  const [values, setValues] = useState({
    id: existingDoctor?.id || "",
    name: existingDoctor?.name || "",
    specialization: existingDoctor?.specialization || "",
    phone: existingDoctor?.phone || "",
    email: existingDoctor?.email || "",
    availability: existingDoctor?.availability || "",
    roomNumber: existingDoctor?.roomNumber || "",
    department: existingDoctor?.department || ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const nextErrors = validateDoctor(values, doctors, existingDoctor?.id);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await upsertDoctor({
      ...values,
      name: values.name.trim(),
      specialization: values.specialization.trim(),
      phone: values.phone.trim(),
      email: values.email.trim().toLowerCase(),
      availability: values.availability.trim(),
      roomNumber: values.roomNumber.trim(),
      department: values.department.trim()
    });

    Alert.alert("Saved", existingDoctor ? "Doctor details updated." : "Doctor added successfully.");
    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{existingDoctor ? "Edit doctor" : "Add doctor"}</Text>
      <Text style={styles.subtitle}>Fill in the required doctor details and keep availability easy to read.</Text>

      <View style={styles.panel}>
        {existingDoctor ? (
          <FormInput label="Doctor ID" value={existingDoctor.id} onChangeText={() => {}} editable={false} />
        ) : null}
        <FormInput label="Name" value={values.name} onChangeText={(value) => handleChange("name", value)} error={errors.name} />
        <FormInput
          label="Specialization"
          value={values.specialization}
          onChangeText={(value) => handleChange("specialization", value)}
          error={errors.specialization}
        />
        <FormInput label="Phone Number" value={values.phone} onChangeText={(value) => handleChange("phone", value)} error={errors.phone} />
        <FormInput label="Email" value={values.email} onChangeText={(value) => handleChange("email", value)} error={errors.email} />
        <FormInput
          label="Availability"
          value={values.availability}
          onChangeText={(value) => handleChange("availability", value)}
          error={errors.availability}
          placeholder="Mon-Fri • 09:00 to 16:00"
        />
        <FormInput
          label="Room Number"
          value={values.roomNumber}
          onChangeText={(value) => handleChange("roomNumber", value)}
          placeholder="Room 12"
        />
        <FormInput
          label="Department"
          value={values.department}
          onChangeText={(value) => handleChange("department", value)}
          placeholder="Cardiology"
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
  }
});
