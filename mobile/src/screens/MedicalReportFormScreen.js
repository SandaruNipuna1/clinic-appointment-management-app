import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const validateReport = (values) => {
  const errors = {};

  ["patientName", "doctorName", "diagnosis", "symptoms", "treatment", "prescriptionNote", "reportDate"].forEach((field) => {
    if (!values[field].trim()) {
      errors[field] = `${field} is required`;
    }
  });

  return errors;
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

export default function MedicalReportFormScreen({ navigation, route }) {
  const { reports, patients, doctors, upsertReport } = useAppData();
  const { currentUser } = useAuth();
  const reportId = route.params?.reportId;
  const existingReport = useMemo(() => reports.find((report) => report.rawId === reportId), [reports, reportId]);
  const initialPatient = patients.find((patient) => patient.rawId === existingReport?.patientId) || null;
  const initialDoctor = doctors.find((doctor) => doctor.name === existingReport?.doctorName) || null;
  const [values, setValues] = useState({
    id: existingReport?.id || "",
    patientName: existingReport?.patientName || initialPatient?.name || "",
    patientId: existingReport?.patientId || initialPatient?.rawId || null,
    doctorName: existingReport?.doctorName || initialDoctor?.name || "",
    doctorId: initialDoctor?.rawId || null,
    diagnosis: existingReport?.diagnosis || "",
    symptoms: existingReport?.symptoms || "",
    treatment: existingReport?.treatment || "",
    prescriptionNote: existingReport?.prescriptionNote || "",
    reportDate: existingReport?.reportDate || getTodayDate(),
    additionalNotes: existingReport?.additionalNotes || ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handlePatientSelect = (patient) => {
    setValues((current) => ({
      ...current,
      patientId: patient.rawId,
      patientName: patient.name
    }));
    setErrors((current) => ({ ...current, patientName: undefined }));
  };

  const handleDoctorSelect = (doctor) => {
    setValues((current) => ({
      ...current,
      doctorId: doctor.rawId,
      doctorName: doctor.name
    }));
    setErrors((current) => ({ ...current, doctorName: undefined }));
  };

  const handleSave = async () => {
    const nextErrors = validateReport(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await upsertReport({
        ...values,
        rawId: existingReport?.rawId,
        patientName: values.patientName.trim(),
        doctorName: values.doctorName.trim(),
        diagnosis: values.diagnosis.trim(),
        symptoms: values.symptoms.trim(),
        treatment: values.treatment.trim(),
        prescriptionNote: values.prescriptionNote.trim(),
        reportDate: values.reportDate.trim(),
        additionalNotes: values.additionalNotes.trim()
      });

      Alert.alert("Saved", existingReport ? "Medical report updated." : "Medical report created.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error.message);
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Access denied</Text>
        <Text style={styles.subtitle}>Only admin users can create or edit medical reports.</Text>
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{existingReport ? "Edit medical report" : "Add medical report"}</Text>
      <Text style={styles.subtitle}>Select the patient and doctor first, then capture the core medical details.</Text>

      <Text style={styles.filterLabel}>Select Patient</Text>
      <Pressable style={styles.selectorField}>
        <Text style={values.patientName ? styles.selectorValue : styles.selectorPlaceholder}>
          {values.patientName || "Select patient"}
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
              <Text style={[styles.optionChipText, values.patientId === patient.rawId && styles.optionChipTextSelected]}>
                {patient.name}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyOptionText}>No patients available yet.</Text>
        )}
      </View>
      {errors.patientName ? <Text style={styles.errorText}>{errors.patientName}</Text> : null}

      <Text style={styles.filterLabel}>Select Doctor</Text>
      <Pressable style={styles.selectorField}>
        <Text style={values.doctorName ? styles.selectorValue : styles.selectorPlaceholder}>
          {values.doctorName || "Select doctor"}
        </Text>
      </Pressable>
      <View style={styles.optionGrid}>
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <Pressable
              key={doctor.rawId}
              style={[styles.optionChip, values.doctorId === doctor.rawId && styles.optionChipSelected]}
              onPress={() => handleDoctorSelect(doctor)}
            >
              <Text style={[styles.optionChipText, values.doctorId === doctor.rawId && styles.optionChipTextSelected]}>
                {doctor.name}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyOptionText}>No doctors available yet.</Text>
        )}
      </View>
      {errors.doctorName ? <Text style={styles.errorText}>{errors.doctorName}</Text> : null}

      <FormInput label="Diagnosis" value={values.diagnosis} onChangeText={(value) => handleChange("diagnosis", value)} error={errors.diagnosis} multiline />
      <FormInput label="Symptoms" value={values.symptoms} onChangeText={(value) => handleChange("symptoms", value)} error={errors.symptoms} multiline />
      <FormInput label="Treatment" value={values.treatment} onChangeText={(value) => handleChange("treatment", value)} error={errors.treatment} multiline />
      <FormInput
        label="Medicines / Prescription Note"
        value={values.prescriptionNote}
        onChangeText={(value) => handleChange("prescriptionNote", value)}
        error={errors.prescriptionNote}
        multiline
      />
      <FormInput label="Report Date" value={values.reportDate} onChangeText={(value) => handleChange("reportDate", value)} error={errors.reportDate} placeholder="YYYY-MM-DD" />
      <FormInput
        label="Additional Notes"
        value={values.additionalNotes}
        onChangeText={(value) => handleChange("additionalNotes", value)}
        multiline
      />

      <PrimaryButton title={existingReport ? "Update Report" : "Save Report"} onPress={handleSave} />
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
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#4b6972",
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
