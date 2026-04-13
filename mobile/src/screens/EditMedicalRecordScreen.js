import React, { useState } from "react";
import { Alert, Text } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { moduleApi } from "../api/moduleApi";
import { useSession } from "../context/SessionContext";
import { validateMedicalRecord } from "../utils/validation";

export default function EditMedicalRecordScreen({ navigation, route }) {
  const { session } = useSession();
  const { record } = route.params;
  const [values, setValues] = useState({
    patientId: record.patientId,
    appointmentId: record.appointmentId,
    doctorName: record.doctorName,
    symptoms: record.symptoms,
    diagnosis: record.diagnosis,
    treatmentNotes: record.treatmentNotes || "",
    visitDate: record.visitDate ? new Date(record.visitDate).toISOString().slice(0, 10) : "",
    status: record.status
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
      await moduleApi.updateMedicalRecord({
        baseUrl: session.apiBaseUrl,
        token: session.token,
        recordId: record._id,
        payload: {
          doctorName: values.doctorName,
          symptoms: values.symptoms,
          diagnosis: values.diagnosis,
          treatmentNotes: values.treatmentNotes,
          visitDate: values.visitDate,
          status: values.status
        }
      });

      Alert.alert("Success", "Medical record updated");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Update failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 14 }}>Edit medical record</Text>
      <FormInput label="Patient ID" value={values.patientId} onChangeText={() => {}} editable={false} />
      <FormInput label="Appointment ID" value={values.appointmentId} onChangeText={() => {}} editable={false} />
      <FormInput label="Doctor Name" value={values.doctorName} onChangeText={(v) => handleChange("doctorName", v)} error={errors.doctorName} />
      <FormInput label="Symptoms" value={values.symptoms} onChangeText={(v) => handleChange("symptoms", v)} error={errors.symptoms} multiline />
      <FormInput label="Diagnosis" value={values.diagnosis} onChangeText={(v) => handleChange("diagnosis", v)} error={errors.diagnosis} multiline />
      <FormInput
        label="Treatment Notes"
        value={values.treatmentNotes}
        onChangeText={(v) => handleChange("treatmentNotes", v)}
        multiline
      />
      <FormInput label="Visit Date" value={values.visitDate} onChangeText={(v) => handleChange("visitDate", v)} error={errors.visitDate} />
      <FormInput label="Status" value={values.status} onChangeText={(v) => handleChange("status", v)} />
      <PrimaryButton title="Save Changes" onPress={handleSubmit} loading={loading} />
    </ScreenContainer>
  );
}
