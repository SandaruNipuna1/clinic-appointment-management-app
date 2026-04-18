import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled"];

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
  const [values, setValues] = useState({
    id: existingAppointment?.id || "",
    patientName: existingAppointment?.patientName || currentUser?.fullName || "",
    doctorId: existingAppointment?.doctorId || doctors[0]?.rawId || "",
    date: existingAppointment?.date || "",
    time: existingAppointment?.time || "",
    reason: existingAppointment?.reason || "",
    status: existingAppointment?.status || "Scheduled"
  });
  const [errors, setErrors] = useState({});
  const [patientQuery, setPatientQuery] = useState(existingAppointment?.patientName || "");
  const [showPatientOptions, setShowPatientOptions] = useState(false);

  const selectedDoctorName = doctors.find((doctor) => doctor.rawId === values.doctorId)?.name || "";
  const selectedPatient = patients.find((patient) => patient.rawId === values.patientId) || null;
  const filteredPatients = useMemo(() => {
    const normalizedQuery = patientQuery.trim().toLowerCase();

    return patients.filter((patient) => !normalizedQuery || patient.name.toLowerCase().includes(normalizedQuery));
  }, [patientQuery, patients]);
  const shouldShowStatusEditor = canManageAppointments && Boolean(existingAppointment);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handlePatientSelect = (patient) => {
    setValues((current) => ({
      ...current,
      patientId: patient.rawId,
      patientName: patient.name
    }));
    setPatientQuery(patient.name);
    setShowPatientOptions(false);
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
        <FormInput
          label="Patient Name"
          value={values.patientName}
          onChangeText={(value) => handleChange("patientName", value)}
          error={errors.patientName}
          editable={isPatient}
        />
        {!isPatient ? (
          <>
            <Text style={styles.filterLabel}>Patient selection</Text>
            <Pressable style={styles.selectorField} onPress={() => setShowPatientOptions((current) => !current)}>
              <Text style={selectedPatient ? styles.selectorValue : styles.selectorPlaceholder}>
                {selectedPatient?.name || "Select patient"}
              </Text>
            </Pressable>
            <FormInput
              label="Search patient"
              value={patientQuery}
              onChangeText={(value) => {
                setPatientQuery(value);
                setShowPatientOptions(true);
              }}
              placeholder="Search patient by name"
            />
            {showPatientOptions ? (
              <View style={styles.optionGrid}>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
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
                  <Text style={styles.emptyOptionText}>No patient matches your search.</Text>
                )}
              </View>
            ) : null}
          </>
        ) : null}

        <Text style={styles.filterLabel}>Doctor selection</Text>
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
        <FormInput label="Time" value={values.time} onChangeText={(value) => handleChange("time", value)} error={errors.time} placeholder="10:30" />
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
