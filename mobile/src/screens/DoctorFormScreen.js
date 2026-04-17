import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

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
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
        {mode === "edit" ? "Edit doctor" : "Add doctor"}
      </Text>
      <Text style={{ color: "#475569", marginBottom: 16 }}>
        Capture doctor profile details and weekly availability in the same clinic app flow.
      </Text>

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

      <Text style={{ fontSize: 17, fontWeight: "700", marginBottom: 10 }}>Availability</Text>
      {values.availability.map((slot, index) => (
        <View
          key={`availability-${index}`}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            padding: 12,
            marginBottom: 12
          }}
        >
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
          <PrimaryButton title="Remove Slot" onPress={() => removeSlot(index)} variant="secondary" />
        </View>
      ))}

      <PrimaryButton title="Add Availability Slot" onPress={addSlot} variant="secondary" />
      <PrimaryButton title={mode === "edit" ? "Update Doctor" : "Save Doctor"} onPress={handleSubmit} loading={loading} />
    </ScreenContainer>
  );
}
