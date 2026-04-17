import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";

const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled"];

const validateAppointment = (values) => {
  const errors = {};

  ["patientName", "doctorId", "date", "time", "reason", "status"].forEach((field) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = `${field} is required`;
    }
  });

  return errors;
};

export default function AppointmentFormScreen({ navigation, route }) {
  const { doctors, appointments, upsertAppointment } = useAppData();
  const appointmentId = route.params?.appointmentId;
  const existingAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === appointmentId),
    [appointments, appointmentId]
  );
  const [values, setValues] = useState({
    id: existingAppointment?.id || "",
    patientName: existingAppointment?.patientName || "",
    doctorId: existingAppointment?.doctorId || doctors[0]?.id || "",
    date: existingAppointment?.date || "",
    time: existingAppointment?.time || "",
    reason: existingAppointment?.reason || "",
    status: existingAppointment?.status || "Scheduled"
  });
  const [errors, setErrors] = useState({});

  const selectedDoctorName = doctors.find((doctor) => doctor.id === values.doctorId)?.name || "";

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const nextErrors = validateAppointment(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await upsertAppointment({
      ...values,
      patientName: values.patientName.trim(),
      doctorName: selectedDoctorName,
      date: values.date.trim(),
      time: values.time.trim(),
      reason: values.reason.trim(),
      status: values.status.trim()
    });

    Alert.alert("Saved", existingAppointment ? "Appointment updated." : "Appointment created.");
    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{existingAppointment ? "Edit appointment" : "Add appointment"}</Text>
      <Text style={styles.subtitle}>Complete the booking details, then save the appointment status and timing.</Text>

      <View style={styles.panel}>
        {existingAppointment ? (
          <FormInput label="Appointment ID" value={existingAppointment.id} onChangeText={() => {}} editable={false} />
        ) : null}
        <FormInput
          label="Patient Name"
          value={values.patientName}
          onChangeText={(value) => handleChange("patientName", value)}
          error={errors.patientName}
        />

        <Text style={styles.filterLabel}>Doctor selection</Text>
        <View style={styles.filterWrap}>
          {doctors.map((doctor) => (
            <PrimaryButton
              key={doctor.id}
              title={doctor.name}
              onPress={() => handleChange("doctorId", doctor.id)}
              variant={values.doctorId === doctor.id ? "primary" : "ghost"}
            />
          ))}
        </View>
        {errors.doctorId ? <Text style={styles.errorText}>{errors.doctorId}</Text> : null}

        <FormInput label="Date" value={values.date} onChangeText={(value) => handleChange("date", value)} error={errors.date} placeholder="YYYY-MM-DD" />
        <FormInput label="Time" value={values.time} onChangeText={(value) => handleChange("time", value)} error={errors.time} placeholder="10:30" />
        <FormInput label="Reason" value={values.reason} onChangeText={(value) => handleChange("reason", value)} error={errors.reason} multiline />

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

      <PrimaryButton title={existingAppointment ? "Update Appointment" : "Save Appointment"} onPress={handleSave} />
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
