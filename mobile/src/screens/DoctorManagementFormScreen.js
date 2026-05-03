// This screen allows creating or editing doctor details.
// It includes input fields for name, specialization, contact details, availability, and other doctor information.
// Only authorized users can access this form.

import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
const PERIOD_OPTIONS = ["AM", "PM"];

const convertTo12Hour = (time) => {
  if (!time) {
    return { hour: "9", minute: "00", period: "AM" };
  }

  const [hourText = "09", minute = "00"] = time.split(":");
  const hourNumber = Number(hourText);
  const period = hourNumber >= 12 ? "PM" : "AM";
  const normalizedHour = hourNumber % 12 || 12;

  return {
    hour: String(normalizedHour),
    minute,
    period
  };
};

const convertTo24Hour = ({ hour, minute, period }) => {
  const normalizedHour = Number(hour) % 12;
  const hour24 = period === "PM" ? normalizedHour + 12 : normalizedHour;
  const finalHour = period === "AM" && Number(hour) === 12 ? 0 : hour24;
  return `${String(finalHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const formatHourInput = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 2);
  if (!digits) {
    return "";
  }
  return String(Math.min(Number(digits), 12));
};

const formatMinuteInput = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 2);
  if (!digits) {
    return "";
  }
  return String(Math.min(Number(digits), 59)).padStart(digits.length === 1 ? 1 : 2, "0");
};

const validateDoctor = (values, doctors, currentId) => {
  const errors = {};

  ["name", "specialization", "phone", "email"].forEach((field) => {
    if (!values[field].trim()) {
      errors[field] = `${field} is required`;
    }
  });

  if (!Array.isArray(values.availabilityDays) || values.availabilityDays.length === 0) {
    errors.availabilityDays = "Select at least one available day";
  }

  if (!values.availabilityStartTime.trim()) {
    errors.availabilityStartTime = "start time is required";
  }

  if (!values.availabilityEndTime.trim()) {
    errors.availabilityEndTime = "end time is required";
  }

  const startHour = Number(values.availabilityStartHour);
  const endHour = Number(values.availabilityEndHour);
  const startMinute = Number(values.availabilityStartMinute);
  const endMinute = Number(values.availabilityEndMinute);

  if (!startHour || startHour < 1 || startHour > 12) {
    errors.availabilityStartTime = "start hour must be between 1 and 12";
  } else if (Number.isNaN(startMinute) || startMinute < 0 || startMinute > 59) {
    errors.availabilityStartTime = "start minute must be between 00 and 59";
  }

  if (!endHour || endHour < 1 || endHour > 12) {
    errors.availabilityEndTime = "end hour must be between 1 and 12";
  } else if (Number.isNaN(endMinute) || endMinute < 0 || endMinute > 59) {
    errors.availabilityEndTime = "end minute must be between 00 and 59";
  }

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
  const initialStartTime = convertTo12Hour(existingDoctor?.availabilityStartTime || "09:00");
  const initialEndTime = convertTo12Hour(existingDoctor?.availabilityEndTime || "16:00");
  const [values, setValues] = useState({
    id: existingDoctor?.id || "",
    name: existingDoctor?.name || "",
    specialization: existingDoctor?.specialization || "",
    phone: existingDoctor?.phone || "",
    email: existingDoctor?.email || "",
    availabilityDay: existingDoctor?.availabilityDay || "",
    availabilityDays: existingDoctor?.availabilityDays || [],
    availabilityStartTime: existingDoctor?.availabilityStartTime || "09:00",
    availabilityEndTime: existingDoctor?.availabilityEndTime || "16:00",
    availabilityStartHour: initialStartTime.hour,
    availabilityStartMinute: initialStartTime.minute,
    availabilityStartPeriod: initialStartTime.period,
    availabilityEndHour: initialEndTime.hour,
    availabilityEndMinute: initialEndTime.minute,
    availabilityEndPeriod: initialEndTime.period,
    roomNumber: existingDoctor?.roomNumber || "",
  });
  const [errors, setErrors] = useState({});
  const [showSpecializations, setShowSpecializations] = useState(false);
  const [showDays, setShowDays] = useState(false);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleDayToggle = (day) => {
    setValues((current) => {
      const exists = current.availabilityDays.includes(day);
      const nextDays = exists
        ? current.availabilityDays.filter((item) => item !== day)
        : [...current.availabilityDays, day];

      return {
        ...current,
        availabilityDays: nextDays,
        availabilityDay: nextDays[0] || ""
      };
    });
  };

  const syncTime = (timeKey, nextValues) => {
    if (timeKey === "start") {
      return convertTo24Hour({
        hour: nextValues.availabilityStartHour || "0",
        minute: nextValues.availabilityStartMinute || "00",
        period: nextValues.availabilityStartPeriod
      });
    }

    return convertTo24Hour({
      hour: nextValues.availabilityEndHour || "0",
      minute: nextValues.availabilityEndMinute || "00",
      period: nextValues.availabilityEndPeriod
    });
  };

  const handleTimeSelection = (timeKey, field, value) => {
    setValues((current) => {
      const nextValues = {
        ...current,
        [field]: value
      };

      if (timeKey === "start") {
        nextValues.availabilityStartTime = syncTime("start", nextValues);
      } else {
        nextValues.availabilityEndTime = syncTime("end", nextValues);
      }

      return nextValues;
    });
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
        availabilityDays: values.availabilityDays,
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
          <Text style={values.availabilityDays.length > 0 ? styles.selectorValue : styles.selectorPlaceholder}>
            {values.availabilityDays.length > 0 ? values.availabilityDays.join(", ") : "Select available days"}
          </Text>
        </Pressable>
        {showDays ? (
          <View style={styles.optionGrid}>
            {DAY_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={[styles.optionChip, values.availabilityDays.includes(option) && styles.optionChipSelected]}
                onPress={() => handleDayToggle(option)}
              >
                <Text style={[styles.optionChipText, values.availabilityDays.includes(option) && styles.optionChipTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {errors.availabilityDays ? <Text style={styles.errorText}>{errors.availabilityDays}</Text> : null}
        <View style={styles.timeSection}>
          <Text style={styles.filterLabel}>Start Time</Text>
          <View style={styles.timeInlineRow}>
            <View style={styles.timeInputBlock}>
              <TextInput
                style={styles.timeInput}
                value={values.availabilityStartHour}
                onChangeText={(value) =>
                  handleTimeSelection("start", "availabilityStartHour", formatHourInput(value))
                }
                keyboardType="number-pad"
                placeholder="9"
                placeholderTextColor="#8aa0ad"
                maxLength={2}
              />
            </View>
            <Text style={styles.timeColon}>:</Text>
            <View style={styles.timeInputBlock}>
              <TextInput
                style={styles.timeInput}
                value={values.availabilityStartMinute}
                onChangeText={(value) =>
                  handleTimeSelection("start", "availabilityStartMinute", formatMinuteInput(value))
                }
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor="#8aa0ad"
                maxLength={2}
              />
            </View>
            <View style={styles.periodGroup}>
              <View style={styles.periodRow}>
                {PERIOD_OPTIONS.map((option) => (
                  <Pressable
                    key={`start-period-${option}`}
                    style={[styles.periodChip, values.availabilityStartPeriod === option && styles.periodChipSelected]}
                    onPress={() => handleTimeSelection("start", "availabilityStartPeriod", option)}
                  >
                    <Text
                      style={[
                        styles.periodChipText,
                        values.availabilityStartPeriod === option && styles.periodChipTextSelected
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          {errors.availabilityStartTime ? <Text style={styles.errorText}>{errors.availabilityStartTime}</Text> : null}
        </View>
        <View style={styles.timeSection}>
          <Text style={styles.filterLabel}>End Time</Text>
          <View style={styles.timeInlineRow}>
            <View style={styles.timeInputBlock}>
              <TextInput
                style={styles.timeInput}
                value={values.availabilityEndHour}
                onChangeText={(value) =>
                  handleTimeSelection("end", "availabilityEndHour", formatHourInput(value))
                }
                keyboardType="number-pad"
                placeholder="4"
                placeholderTextColor="#8aa0ad"
                maxLength={2}
              />
            </View>
            <Text style={styles.timeColon}>:</Text>
            <View style={styles.timeInputBlock}>
              <TextInput
                style={styles.timeInput}
                value={values.availabilityEndMinute}
                onChangeText={(value) =>
                  handleTimeSelection("end", "availabilityEndMinute", formatMinuteInput(value))
                }
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor="#8aa0ad"
                maxLength={2}
              />
            </View>
            <View style={styles.periodGroup}>
              <View style={styles.periodRow}>
                {PERIOD_OPTIONS.map((option) => (
                  <Pressable
                    key={`end-period-${option}`}
                    style={[styles.periodChip, values.availabilityEndPeriod === option && styles.periodChipSelected]}
                    onPress={() => handleTimeSelection("end", "availabilityEndPeriod", option)}
                  >
                    <Text
                      style={[
                        styles.periodChipText,
                        values.availabilityEndPeriod === option && styles.periodChipTextSelected
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          {errors.availabilityEndTime ? <Text style={styles.errorText}>{errors.availabilityEndTime}</Text> : null}
        </View>
        <FormInput
          label="Room Number"
          value={values.roomNumber}
          onChangeText={(value) => handleChange("roomNumber", value.replace(/\D/g, ""))}
          placeholder="12"
          keyboardType="number-pad"
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
  timeSection: {
    marginBottom: 10
  },
  timeInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6
  },
  timeInputBlock: {
    width: 68
  },
  periodGroup: {
    flex: 1
  },
  periodRow: {
    flexDirection: "row",
    gap: 8
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
  periodChip: {
    minWidth: 74,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d3dee5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff"
  },
  periodChipSelected: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e"
  },
  periodChipText: {
    color: "#29444b",
    fontWeight: "700",
    fontSize: 15
  },
  periodChipTextSelected: {
    color: "#ffffff"
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#d3dee5",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    fontSize: 18,
    color: "#12303a",
    fontWeight: "700",
    textAlign: "center"
  },
  timeColon: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    color: "#38525b",
    paddingTop: 2
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 10
  }
});
