// This screen lets users create or edit doctor availability schedules.
// It includes fields for doctor name, available days, start/end times, and status.
// The schedule form validates entry before saving.

import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STATUS_OPTIONS = ["Available", "Unavailable"];
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

  const number = Number(digits);
  if (number <= 0) {
    return "1";
  }

  return String(Math.min(number, 12));
};

const formatMinuteInput = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 2);

  if (!digits) {
    return "";
  }

  return String(Math.min(Number(digits), 59)).padStart(digits.length === 1 ? 1 : 2, "0");
};

const validateSchedule = (values) => {
  const errors = {};

  ["doctorId", "doctorName", "startTime", "endTime", "status"].forEach((field) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = `${field} is required`;
    }
  });

  if (!Array.isArray(values.availableDays) || values.availableDays.length === 0) {
    errors.availableDays = "availableDays is required";
  }

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
  const initialStartTime = convertTo12Hour(existingSchedule?.startTime || "09:00");
  const initialEndTime = convertTo12Hour(existingSchedule?.endTime || "17:00");
  const [values, setValues] = useState({
    doctorId: existingSchedule?.doctorId || doctors[0]?.rawId || null,
    doctorName: existingSchedule?.doctorName || doctors[0]?.name || "",
    availableDays: existingSchedule?.availableDays?.length ? existingSchedule.availableDays : ["Monday"],
    startTime: existingSchedule?.startTime || "09:00",
    endTime: existingSchedule?.endTime || "17:00",
    startHour: initialStartTime.hour,
    startMinute: initialStartTime.minute,
    startPeriod: initialStartTime.period,
    endHour: initialEndTime.hour,
    endMinute: initialEndTime.minute,
    endPeriod: initialEndTime.period,
    status: existingSchedule?.status || "Available"
  });
  const [errors, setErrors] = useState({});
  const [showDoctors, setShowDoctors] = useState(false);

  const canManageSchedules = ["admin", "receptionist"].includes(currentUser?.role);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleTimeSelection = (timeKey, field, value) => {
    setValues((current) => {
      const nextValues = {
        ...current,
        [field]: value
      };

      if (timeKey === "start") {
        nextValues.startTime = convertTo24Hour({
          hour: nextValues.startHour || "0",
          minute: nextValues.startMinute || "00",
          period: nextValues.startPeriod
        });
      } else {
        nextValues.endTime = convertTo24Hour({
          hour: nextValues.endHour || "0",
          minute: nextValues.endMinute || "00",
          period: nextValues.endPeriod
        });
      }

      return nextValues;
    });
  };

  const toggleDay = (day) => {
    setValues((current) => {
      const exists = current.availableDays.includes(day);
      return {
        ...current,
        availableDays: exists
          ? current.availableDays.filter((item) => item !== day)
          : [...current.availableDays, day]
      };
    });
  };

  const renderTimeField = (label, timeKey, hourField, minuteField, periodField, errorKey) => (
    <View style={styles.timeSection}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.timeCard}>
        <View style={styles.timeInputsRow}>
          <View style={styles.timeInputBlock}>
            <TextInput
              style={styles.timeInput}
              value={values[hourField]}
              onChangeText={(value) => handleTimeSelection(timeKey, hourField, formatHourInput(value))}
              keyboardType="number-pad"
              placeholder={timeKey === "start" ? "9" : "5"}
              placeholderTextColor="#8aa0ad"
              maxLength={2}
            />
          </View>
          <Text style={styles.timeColon}>:</Text>
          <View style={styles.timeInputBlock}>
            <TextInput
              style={styles.timeInput}
              value={values[minuteField]}
              onChangeText={(value) => handleTimeSelection(timeKey, minuteField, formatMinuteInput(value))}
              keyboardType="number-pad"
              placeholder="00"
              placeholderTextColor="#8aa0ad"
              maxLength={2}
            />
          </View>
          <View style={styles.periodGroup}>
            <View style={styles.periodRow}>
              {PERIOD_OPTIONS.map((option) => {
                const selected = values[periodField] === option;

                return (
                  <Pressable
                    key={`${timeKey}-${option}`}
                    style={[styles.periodChip, selected && styles.periodChipSelected]}
                    onPress={() => handleTimeSelection(timeKey, periodField, option)}
                  >
                    <Text style={[styles.periodChipText, selected && styles.periodChipTextSelected]}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
      {errors[errorKey] ? <Text style={styles.errorText}>{errors[errorKey]}</Text> : null}
    </View>
  );

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
        <Text style={styles.filterLabel}>Select Doctor</Text>
        <Pressable style={styles.selectorField} onPress={() => setShowDoctors((current) => !current)}>
          <Text style={values.doctorName ? styles.selectorValue : styles.selectorPlaceholder}>
            {values.doctorName || "Select doctor"}
          </Text>
        </Pressable>
        {showDoctors ? (
          <View style={styles.optionGrid}>
            {doctors.map((doctor) => (
              <Pressable
                key={doctor.rawId}
                style={[styles.optionChip, values.doctorName === doctor.name && styles.optionChipSelected]}
                onPress={() => {
                  handleChange("doctorId", doctor.rawId);
                  handleChange("doctorName", doctor.name);
                  setShowDoctors(false);
                }}
              >
                <Text style={[styles.optionChipText, values.doctorName === doctor.name && styles.optionChipTextSelected]}>
                  {doctor.name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={styles.filterLabel}>Available Days</Text>
        <View style={styles.filterWrap}>
          {DAY_OPTIONS.map((option) => (
            <PrimaryButton
              key={option}
              title={option}
              onPress={() => toggleDay(option)}
              variant={values.availableDays.includes(option) ? "primary" : "ghost"}
            />
          ))}
        </View>
        {errors.availableDays ? <Text style={styles.errorText}>{errors.availableDays}</Text> : null}

        {renderTimeField("Start Time", "start", "startHour", "startMinute", "startPeriod", "startTime")}
        {renderTimeField("End Time", "end", "endHour", "endMinute", "endPeriod", "endTime")}

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
  filterWrap:  {
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
  timeCard: {
    borderWidth: 1,
    borderColor: "#d3dee5",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#f9fcfd",
    marginBottom: 8
  },
  timeInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  timeInputBlock: {
    width: 68
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
    flex: 1,
    minWidth: 64,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d3dee5",
    borderRadius: 999,
    paddingHorizontal: 12,
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
  errorText: {
    color: "#dc2626",
    marginBottom: 10
  }
});
