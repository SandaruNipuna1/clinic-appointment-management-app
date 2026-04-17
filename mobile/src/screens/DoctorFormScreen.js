import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useSession } from "../context/SessionContext";
import { moduleApi } from "../api/moduleApi";
import { validateDoctor } from "../utils/validation";

const createEmptySlot = () => ({
  day: "Monday",
  startTime: "09:00",
  endTime: "17:00"
});

export default function DoctorFormScreen({ navigation, route }) {
  const { session } = useSession();
  const { mode = "create", doctor } = route.params || {};
  const [values, setValues] = useState({
    name: doctor?.name || "",
    specialization: doctor?.specialization || "",
    email: doctor?.email || "",
    phone: doctor?.phone || "",
    experience: doctor?.experience != null ? String(doctor.experience) : "",
    bio: doctor?.bio || "",
    availability: doctor?.availability?.length ? doctor.availability : [createEmptySlot()]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateSlot = (index, field, value) => {
    setValues((current) => ({
      ...current,
      availability: current.availability.map((slot, slotIndex) =>
        slotIndex === index
          ? {
              ...slot,
              [field]: value
            }
          : slot
      )
    }));
  };

  const addSlot = () => {
    setValues((current) => ({
      ...current,
      availability: [...current.availability, createEmptySlot()]
    }));
  };

  const removeSlot = (index) => {
    setValues((current) => ({
      ...current,
      availability:
        current.availability.length === 1
          ? [createEmptySlot()]
          : current.availability.filter((_, slotIndex) => slotIndex !== index)
    }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateDoctor(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = {
      name: values.name.trim(),
      specialization: values.specialization.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      experience: values.experience.trim() ? Number(values.experience) : 0,
      bio: values.bio.trim(),
      availability: values.availability.map((slot) => ({
        day: slot.day.trim(),
        startTime: slot.startTime.trim(),
        endTime: slot.endTime.trim()
      }))
    };

    try {
      setLoading(true);

      if (mode === "edit" && doctor?._id) {
        await moduleApi.updateDoctor({
          baseUrl: session.apiBaseUrl,
          token: session.token,
          doctorId: doctor._id,
          payload
        });
      } else {
        await moduleApi.createDoctor({
          baseUrl: session.apiBaseUrl,
          token: session.token,
          payload
        });
      }

      Alert.alert("Success", mode === "edit" ? "Doctor updated successfully." : "Doctor created successfully.");
      navigation.goBack();
    } catch (apiError) {
      Alert.alert(mode === "edit" ? "Update failed" : "Create failed", apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{mode === "edit" ? "Doctor Update" : "Doctor Onboarding"}</Text>
        <Text style={styles.heroTitle}>{mode === "edit" ? "Refine the doctor profile" : "Add a new doctor profile"}</Text>
        <Text style={styles.heroText}>
          Keep the profile concise, professional, and ready for quick scheduling decisions by the clinic team.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Profile details</Text>
        <FormInput label="Name" value={values.name} onChangeText={(value) => handleChange("name", value)} error={errors.name} />
        <FormInput
          label="Specialization"
          value={values.specialization}
          onChangeText={(value) => handleChange("specialization", value)}
          error={errors.specialization}
        />
        <FormInput label="Email" value={values.email} onChangeText={(value) => handleChange("email", value)} error={errors.email} />
        <FormInput label="Phone" value={values.phone} onChangeText={(value) => handleChange("phone", value)} error={errors.phone} />
        <FormInput
          label="Experience (years)"
          value={values.experience}
          onChangeText={(value) => handleChange("experience", value)}
          error={errors.experience}
        />
        <FormInput label="Bio" value={values.bio} onChangeText={(value) => handleChange("bio", value)} multiline />
      </View>

      <Text style={styles.sectionTitle}>Availability schedule</Text>
      {values.availability.map((slot, index) => (
        <View key={`availability-${index}`} style={styles.slotCard}>
          <Text style={styles.slotTitle}>Time block {index + 1}</Text>
          <FormInput
            label="Day"
            value={slot.day}
            onChangeText={(value) => updateSlot(index, "day", value)}
            error={errors[`availability_${index}_day`]}
          />
          <FormInput
            label="Start Time"
            value={slot.startTime}
            onChangeText={(value) => updateSlot(index, "startTime", value)}
            placeholder="09:00"
            error={errors[`availability_${index}_startTime`]}
          />
          <FormInput
            label="End Time"
            value={slot.endTime}
            onChangeText={(value) => updateSlot(index, "endTime", value)}
            placeholder="17:00"
            error={errors[`availability_${index}_endTime`]}
          />
          <PrimaryButton title="Remove Slot" onPress={() => removeSlot(index)} variant="ghost" />
        </View>
      ))}

      <PrimaryButton title="Add Availability Slot" onPress={addSlot} variant="secondary" />
      <PrimaryButton title={mode === "edit" ? "Update Doctor" : "Save Doctor"} onPress={handleSubmit} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#fffaf0",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#f0dfb9"
  },
  heroEyebrow: {
    color: "#a16207",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 10
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#21313a",
    marginBottom: 10
  },
  heroText: {
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 22
  },
  panel: {
    backgroundColor: "#fcfffe",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#deeaef"
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 12
  },
  slotCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e0e9ee",
    padding: 16,
    marginBottom: 14
  },
  slotTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#21404a",
    marginBottom: 10
  }
});
