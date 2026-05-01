import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled"];
const PERIOD_OPTIONS = ["AM", "PM"];

const convertTo12Hour = (time) => {
  if (!time) {
    return { hour: "10", minute: "30", period: "AM" };
  }

  const [hourText = "10", minute = "30"] = time.split(":");
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

const validateAppointment = (values, options = {}) => {
  const errors = {};
  const { requiresStatus = false } = options;

  ["patientName", "doctorId", "date", "time", "reason"].forEach((field) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = `${field} is required`;
    }
  });

  if (requiresStatus && !String(values.status || "").trim()) {
    errors.status = "status is required";
  }

  const timeHour = Number(values.timeHour);
  const timeMinute = Number(values.timeMinute);

  if (!timeHour || timeHour < 1 || timeHour > 12) {
    errors.time = "hour must be between 1 and 12";
  } else if (Number.isNaN(timeMinute) || timeMinute < 0 || timeMinute > 59) {
    errors.time = "minute must be between 00 and 59";
  }

  return errors;
};

export default function AppointmentFormScreen({ navigation, route }) {
  const { doctors, patients, appointments, upsertAppointment } = useAppData();
  const { currentUser } = useAuth();
  const appointmentId = route.params?.appointmentId;
  const existingAppointment = useMemo(
    () => appointments.find((appointment) => appointment.rawId === appointmentId),
    [appointments, appointmentId]
  );
  const isPatient = currentUser?.role === "patient";
  const canManageAppointments = ["admin", "receptionist"].includes(currentUser?.role);
  const initialTime = convertTo12Hour(existingAppointment?.time || "10:30");
  const [values, setValues] = useState({
    id: existingAppointment?.id || "",
    patientName: existingAppointment?.patientName || currentUser?.fullName || "",
    patientId: existingAppointment?.patientId || null,
    doctorId: existingAppointment?.doctorId || doctors[0]?.rawId || "",
    date: existingAppointment?.date || "",
    time: existingAppointment?.time || "10:30",
    timeHour: initialTime.hour,
    timeMinute: initialTime.minute,
    timePeriod: initialTime.period,
    reason: existingAppointment?.reason || "",
    status: existingAppointment?.status || "Scheduled"
  });
  const [errors, setErrors] = useState({});
  const selectedDoctorName = doctors.find((doctor) => doctor.rawId === values.doctorId)?.name || "";
  const selectedPatient = patients.find((patient) => patient.rawId === values.patientId) || null;
  const shouldShowStatusEditor = canManageAppointments && Boolean(existingAppointment);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleTimeSelection = (field, value) => {
    setValues((current) => {
      const nextValues = {
        ...current,
        [field]: value
      };

      nextValues.time = convertTo24Hour({
        hour: nextValues.timeHour || "0",
        minute: nextValues.timeMinute || "00",
        period: nextValues.timePeriod
      });

      return nextValues;
    });
  };

  const handlePatientSelect = (patient) => {
    setValues((current) => ({
      ...current,
      patientId: patient.rawId,
      patientName: patient.name
    }));
    setErrors((current) => ({ ...current, patientName: undefined }));
  };

  const handleSave = async () => {
    const nextErrors = validateAppointment(values, {
      requiresStatus: shouldShowStatusEditor
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await upsertAppointment({
        ...values,
        rawId: existingAppointment?.rawId,
        patientName: values.patientName.trim(),
        patientId: isPatient ? currentUser?.id : values.patientId || existingAppointment?.patientId || null,
        doctorName: selectedDoctorName,
        date: values.date.trim(),
        time: values.time.trim(),
        reason: values.reason.trim(),
        status: shouldShowStatusEditor ? values.status.trim() : "Scheduled"
      });

      Alert.alert("Saved", existingAppointment ? "Appointment updated." : "Appointment created.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error.message);
    }
  };

  if (!["admin", "receptionist", "patient"].includes(currentUser?.role)) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Access denied</Text>
        <Text style={styles.subtitle}>You do not have permission to create or edit appointments.</Text>
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  if (isPatient && existingAppointment) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Access denied</Text>
        <Text style={styles.subtitle}>Patients can create appointments and cancel their own bookings from the list.</Text>
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const renderTimeField = () => (
    <View style={styles.timeSection}>
      <Text style={styles.filterLabel}>Time</Text>
      <View style={styles.timeCard}>
        <View style={styles.timeInputsRow}>
          <View style={styles.timeInputBlock}>
            <TextInput
              style={styles.timeInput}
              value={values.timeHour}
              onChangeText={(value) => handleTimeSelection("timeHour", formatHourInput(value))}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor="#8aa0ad"
              maxLength={2}
            />
          </View>
          <Text style={styles.timeColon}>:</Text>
          <View style={styles.timeInputBlock}>
            <TextInput
              style={styles.timeInput}
              value={values.timeMinute}
              onChangeText={(value) => handleTimeSelection("timeMinute", formatMinuteInput(value))}
              keyboardType="number-pad"
              placeholder="30"
              placeholderTextColor="#8aa0ad"
              maxLength={2}
            />
          </View>
          <View style={styles.periodGroup}>
            <View style={styles.periodRow}>
              {PERIOD_OPTIONS.map((option) => {
                const selected = values.timePeriod === option;

                return (
                  <Pressable
                    key={option}
                    style={[styles.periodChip, selected && styles.periodChipSelected]}
                    onPress={() => handleTimeSelection("timePeriod", option)}
                  >
                    <Text style={[styles.periodChipText, selected && styles.periodChipTextSelected]}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
      {errors.time ? <Text style={styles.errorText}>{errors.time}</Text> : null}
    </View>
  );

  return (
    <ScreenContainer>
      <Text style={styles.title}>{existingAppointment ? "Edit appointment" : "Add appointment"}</Text>
      <Text style={styles.subtitle}>
        {isPatient
          ? "Choose a doctor, date, time, and reason to book your appointment."
          : "Complete the booking details, then save the appointment status and timing."}
      </Text>

      <View style={styles.panel}>
        {existingAppointment ? (
          <FormInput label="Appointment ID" value={existingAppointment.id} onChangeText={() => {}} editable={false} />
        ) : null}
        {isPatient ? (
          <FormInput
            label="Patient Name"
            value={values.patientName}
            onChangeText={(value) => handleChange("patientName", value)}
            error={errors.patientName}
            editable={false}
          />
        ) : (
          <>
            <Text style={styles.filterLabel}>Select Patient</Text>
            <Pressable style={styles.selectorField}>
              <Text style={selectedPatient ? styles.selectorValue : styles.selectorPlaceholder}>
                {selectedPatient?.name || "Select patient"}
              </Text>
            </Pressable>
            <View style={styles.optionGrid}>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <Pressable
                    key={patient.rawId}
                    style={[styles.optionChip, values.patientId === patient.rawId && styles.optionChipSelected]}
                    onPress={() => handlePatientSelect(patient)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        values.patientId === patient.rawId && styles.optionChipTextSelected
                      ]}
                    >
                      {patient.name}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.emptyOptionText}>No patients available yet.</Text>
              )}
            </View>
          </>
        )}

        <Text style={styles.filterLabel}>Select Doctor</Text>
        <View style={styles.filterWrap}>
          {doctors.map((doctor) => (
            <PrimaryButton
              key={doctor.rawId}
              title={doctor.name}
              onPress={() => handleChange("doctorId", doctor.rawId)}
              variant={values.doctorId === doctor.rawId ? "primary" : "ghost"}
            />
          ))}
        </View>
        {errors.doctorId ? <Text style={styles.errorText}>{errors.doctorId}</Text> : null}

        <FormInput label="Date" value={values.date} onChangeText={(value) => handleChange("date", value)} error={errors.date} placeholder="YYYY-MM-DD" />
        {renderTimeField()}
        <FormInput label="Reason" value={values.reason} onChangeText={(value) => handleChange("reason", value)} error={errors.reason} multiline />

        {shouldShowStatusEditor ? (
          <>
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
          </>
        ) : null}
      </View>

      <PrimaryButton
        title={existingAppointment ? "Update Appointment" : isPatient ? "Book Appointment" : "Save Appointment"}
        onPress={handleSave}
      />
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
  emptyOptionText: {
    color: "#60757d",
    marginBottom: 8
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 10
  }
});
