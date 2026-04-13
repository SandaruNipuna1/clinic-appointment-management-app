import React, { useState } from "react";
import { Alert, Text } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { moduleApi } from "../api/moduleApi";
import { useSession } from "../context/SessionContext";
import { validateMedicalRecord } from "../utils/validation";

export default function CreateMedicalRecordScreen({ navigation, route }) {
  const { session } = useSession();
  const [values, setValues] = useState({
    patientId: route.params?.patientId || "",
    appointmentId: "",
    doctorName: "",
    symptoms: "",
    diagnosis: "",
    treatmentNotes: "",
    visitDate: "",
    status: "active"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateMedicalRecord(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      await moduleApi.createMedicalRecord({
        baseUrl: session.apiBaseUrl,
        token: session.token,
        payload: values
      });

      Alert.alert("Success", "Medical record created");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Create failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 14 }}>Create a medical record</Text>
      <FormInput label="Patient ID" value={values.patientId} onChangeText={(v) => handleChange("patientId", v)} error={errors.patientId} />
      <FormInput
        label="Appointment ID"
        value={values.appointmentId}
        onChangeText={(v) => handleChange("appointmentId", v)}
        error={errors.appointmentId}
      />
      <FormInput label="Doctor Name" value={values.doctorName} onChangeText={(v) => handleChange("doctorName", v)} error={errors.doctorName} />
      <FormInput label="Symptoms" value={values.symptoms} onChangeText={(v) => handleChange("symptoms", v)} error={errors.symptoms} multiline />
      <FormInput label="Diagnosis" value={values.diagnosis} onChangeText={(v) => handleChange("diagnosis", v)} error={errors.diagnosis} multiline />
      <FormInput
        label="Treatment Notes"
        value={values.treatmentNotes}
        onChangeText={(v) => handleChange("treatmentNotes", v)}
        multiline
      />
      <FormInput
        label="Visit Date"
        value={values.visitDate}
        onChangeText={(v) => handleChange("visitDate", v)}
        error={errors.visitDate}
        placeholder="2026-04-12"
      />
      <FormInput label="Status" value={values.status} onChangeText={(v) => handleChange("status", v)} placeholder="active" />
      <PrimaryButton title="Create Medical Record" onPress={handleSubmit} loading={loading} />
    </ScreenContainer>
  );
}
