import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createAppointment } from "../services/appointmentApi";
import { validateAppointmentInputs } from "../utils/appointmentValidation";

const SAMPLE_PATIENTS = [
  { id: "661111111111111111111111", name: "Nimal Perera" },
  { id: "661111111111111111111112", name: "Kavindi Silva" }
];

const SAMPLE_DOCTORS = [
  { id: "662222222222222222222221", name: "Dr. Fernando", specialty: "General Medicine", badge: "GF" },
  { id: "662222222222222222222222", name: "Dr. Jayasinghe", specialty: "Cardiology", badge: "CJ" }
];

const AppointmentFormScreen = ({ onAppointmentCreated }) => {
  const [form, setForm] = useState({
    patientId: SAMPLE_PATIENTS[0].id,
    doctorId: SAMPLE_DOCTORS[0].id,
    appointmentDate: "",
    appointmentTime: "",
    reason: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!form.patientId || !form.doctorId || !form.appointmentDate || !form.appointmentTime || !form.reason) {
      Alert.alert("Missing details", "Please fill in all appointment fields.");
      return;
    }

    const validationMessage = validateAppointmentInputs(form);
    if (validationMessage) {
      Alert.alert("Invalid appointment details", validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      const result = await createAppointment(form);

      if (!result.success) {
        Alert.alert("Booking failed", result.message || "Unable to create appointment.");
        return;
      }

      const selectedPatient = SAMPLE_PATIENTS.find((patient) => patient.id === form.patientId);
      const selectedDoctor = SAMPLE_DOCTORS.find((doctor) => doctor.id === form.doctorId);
      const successMessage = `${selectedPatient?.name || "Patient"} booked with ${selectedDoctor?.name || "doctor"} on ${form.appointmentDate} at ${form.appointmentTime}.`;

      Alert.alert("Success", "Appointment created successfully.");
      onAppointmentCreated?.(successMessage);
      setForm({
        patientId: SAMPLE_PATIENTS[0].id,
        doctorId: SAMPLE_DOCTORS[0].id,
        appointmentDate: "",
        appointmentTime: "",
        reason: ""
      });
    } catch (_error) {
      Alert.alert("Network error", "Make sure the backend server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <Text style={styles.heading}>New Appointment</Text>
      <Text style={styles.intro}>Enter the visit details below.</Text>
      <Text style={styles.sectionLabel}>Patient</Text>
      <View style={styles.optionRow}>
        {SAMPLE_PATIENTS.map((patient) => (
          <TouchableOpacity
            key={patient.id}
            style={[styles.optionChip, form.patientId === patient.id && styles.optionChipActive]}
            onPress={() => updateField("patientId", patient.id)}
          >
            <Text style={[styles.optionLabel, form.patientId === patient.id && styles.optionLabelActive]}>{patient.name}</Text>
            <Text style={[styles.optionMeta, form.patientId === patient.id && styles.optionMetaActive]}>Profile</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionLabel}>Doctor</Text>
      <View style={styles.optionRow}>
        {SAMPLE_DOCTORS.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={[styles.optionChip, form.doctorId === doctor.id && styles.optionChipActive]}
            onPress={() => updateField("doctorId", doctor.id)}
          >
            <View style={styles.doctorHeader}>
              <View style={[styles.doctorBadge, form.doctorId === doctor.id && styles.doctorBadgeActive]}>
                <Text style={[styles.doctorBadgeText, form.doctorId === doctor.id && styles.doctorBadgeTextActive]}>{doctor.badge}</Text>
              </View>
              <View style={styles.doctorInfo}>
                <Text style={[styles.optionLabel, form.doctorId === doctor.id && styles.optionLabelActive]}>{doctor.name}</Text>
                <Text style={[styles.optionMeta, form.doctorId === doctor.id && styles.optionMetaActive]}>{doctor.specialty}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.row}>
        <View style={styles.rowColumn}>
          <Text style={styles.inputLabel}>Appointment Date</Text>
          <TextInput
            placeholder="2026-04-10"
            placeholderTextColor="#8ea1bb"
            style={styles.input}
            value={form.appointmentDate}
            onChangeText={(value) => updateField("appointmentDate", value)}
          />
        </View>
        <View style={styles.rowColumn}>
          <Text style={styles.inputLabel}>Appointment Time</Text>
          <TextInput
            placeholder="10:30"
            placeholderTextColor="#8ea1bb"
            style={styles.input}
            value={form.appointmentTime}
            onChangeText={(value) => updateField("appointmentTime", value)}
          />
        </View>
      </View>
      <Text style={styles.helperText}>Use YYYY-MM-DD and 24-hour time.</Text>
      <Text style={styles.inputLabel}>Reason</Text>
      <TextInput
        placeholder="General checkup"
        placeholderTextColor="#8ea1bb"
        style={[styles.input, styles.reasonInput]}
        value={form.reason}
        onChangeText={(value) => updateField("reason", value)}
        multiline
      />
      <Text style={styles.helperText}>Add a short note for the visit.</Text>
      <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? "Saving..." : "Save Appointment"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#132238"
  },
  intro: {
    color: "#647892",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18
  },
  input: {
    borderWidth: 1,
    borderColor: "#c8d7eb",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: "#f7fbff",
    color: "#132238",
    fontSize: 16
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    color: "#4d637b"
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16
  },
  optionChip: {
    borderWidth: 1,
    borderColor: "#d7e6f8",
    backgroundColor: "#f6faff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 138,
    flex: 1
  },
  optionChipActive: {
    backgroundColor: "#1d6ef2",
    borderColor: "#1d6ef2",
    shadowColor: "#1d6ef2",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  optionLabel: {
    color: "#1d6ef2",
    fontWeight: "700",
    fontSize: 14
  },
  optionLabelActive: {
    color: "#ffffff"
  },
  optionMeta: {
    marginTop: 3,
    color: "#6f86a4",
    fontSize: 11
  },
  optionMetaActive: {
    color: "#dce9ff"
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  doctorBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#dceaff",
    alignItems: "center",
    justifyContent: "center"
  },
  doctorBadgeActive: {
    backgroundColor: "#ffffff"
  },
  doctorBadgeText: {
    color: "#1d6ef2",
    fontWeight: "700",
    fontSize: 12
  },
  doctorBadgeTextActive: {
    color: "#0f2747"
  },
  doctorInfo: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  rowColumn: {
    flex: 1
  },
  inputLabel: {
    color: "#29415f",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8
  },
  helperText: {
    color: "#7b8ca3",
    marginBottom: 14,
    fontSize: 12,
    lineHeight: 18
  },
  reasonInput: {
    minHeight: 92,
    textAlignVertical: "top"
  },
  button: {
    marginTop: 8,
    backgroundColor: "#0f2747",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#0f2747",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 17
  }
});

export default AppointmentFormScreen;
