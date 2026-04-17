import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";

const validateReport = (values) => {
  const errors = {};

  ["patientName", "doctorName", "diagnosis", "symptoms", "treatment", "prescriptionNote", "reportDate"].forEach((field) => {
    if (!values[field].trim()) {
      errors[field] = `${field} is required`;
    }
  });

  return errors;
};

export default function MedicalReportFormScreen({ navigation, route }) {
  const { reports, upsertReport } = useAppData();
  const reportId = route.params?.reportId;
  const existingReport = useMemo(() => reports.find((report) => report.id === reportId), [reports, reportId]);
  const [values, setValues] = useState({
    id: existingReport?.id || "",
    patientName: existingReport?.patientName || "",
    doctorName: existingReport?.doctorName || "",
    diagnosis: existingReport?.diagnosis || "",
    symptoms: existingReport?.symptoms || "",
    treatment: existingReport?.treatment || "",
    prescriptionNote: existingReport?.prescriptionNote || "",
    reportDate: existingReport?.reportDate || "",
    additionalNotes: existingReport?.additionalNotes || ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const nextErrors = validateReport(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await upsertReport({
      ...values,
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
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{existingReport ? "Edit medical report" : "Add medical report"}</Text>
      <Text style={styles.subtitle}>Capture diagnosis, treatment, prescription notes, and follow-up context.</Text>

      <FormInput label="Patient Name" value={values.patientName} onChangeText={(value) => handleChange("patientName", value)} error={errors.patientName} />
      <FormInput label="Doctor Name" value={values.doctorName} onChangeText={(value) => handleChange("doctorName", value)} error={errors.doctorName} />
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
  }
});
