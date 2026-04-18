import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STATUS_OPTIONS = ["Available", "Unavailable"];

const validateSchedule = (values) => {
  const errors = {};

  ["doctorName", "availableDay", "startTime", "endTime", "status"].forEach((field) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = `${field} is required`;
    }
  });

  return errors;
};

export default function ScheduleFormScreen({ navigation, route }) {
  const { doctors, schedules, upsertSchedule } = useAppData();
  const { currentUser } = useAuth();
  const scheduleId = route.params?.scheduleId;
  const existingSchedule = useMemo(
    () => schedules.find((schedule) => schedule.rawId === scheduleId),
    [scheduleId, schedules]
  );
  const [values, setValues] = useState({
    doctorName: existingSchedule?.doctorName || doctors[0]?.name || "",
    availableDay: existingSchedule?.availableDay || "Monday",
    startTime: existingSchedule?.startTime || "",
    endTime: existingSchedule?.endTime || "",
    status: existingSchedule?.status || "Available"
  });
  const [errors, setErrors] = useState({});

  const canManageSchedules = ["admin", "receptionist"].includes(currentUser?.role);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const nextErrors = validateSchedule(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await upsertSchedule({
        ...values,
        rawId: existingSchedule?.rawId
      });

      Alert.alert("Saved", existingSchedule ? "Schedule updated." : "Schedule added successfully.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error.message);
    }
  };

  if (!canManageSchedules) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Access denied</Text>
        <Text style={styles.subtitle}>Only admin and receptionist roles can add or edit schedules.</Text>
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{existingSchedule ? "Edit schedule" : "Add schedule"}</Text>
      <Text style={styles.subtitle}>Fill in the doctor, day, hours, and status for this availability slot.</Text>

      <View style={styles.panel}>
        <FormInput
          label="Doctor Name"
          value={values.doctorName}
          onChangeText={(value) => handleChange("doctorName", value)}
          error={errors.doctorName}
          placeholder="Dr. Amal Silva"
        />

        <Text style={styles.filterLabel}>Available Day</Text>
        <View style={styles.filterWrap}>
          {DAY_OPTIONS.map((option) => (
            <PrimaryButton
              key={option}
              title={option}
              onPress={() => handleChange("availableDay", option)}
              variant={values.availableDay === option ? "primary" : "ghost"}
            />
          ))}
        </View>
        {errors.availableDay ? <Text style={styles.errorText}>{errors.availableDay}</Text> : null}

        <FormInput
          label="Start Time"
          value={values.startTime}
          onChangeText={(value) => handleChange("startTime", value)}
          error={errors.startTime}
          placeholder="09:00"
        />
        <FormInput
          label="End Time"
          value={values.endTime}
          onChangeText={(value) => handleChange("endTime", value)}
          error={errors.endTime}
          placeholder="17:00"
        />

        <Text style={styles.filterLabel}>Status</Text>
        <View style={styles.filterWrap}>
          {STATUS_OPTIONS.map((option) => (
            <PrimaryButton
              key={option}
              title={option}
              onPress={() => handleChange("status", option)}
              variant={values.status === option ? "primary" : "ghost"}
            />
          ))}
        </View>
        {errors.status ? <Text style={styles.errorText}>{errors.status}</Text> : null}
      </View>

      <PrimaryButton title={existingSchedule ? "Update Schedule" : "Save Schedule"} onPress={handleSave} />
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
