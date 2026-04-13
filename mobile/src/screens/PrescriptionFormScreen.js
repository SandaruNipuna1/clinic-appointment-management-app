import React, { useState } from "react";
import { Alert, Text } from "react-native";

import MedicineFields from "../components/MedicineFields";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import FormInput from "../components/FormInput";
import { moduleApi } from "../api/moduleApi";
import { useSession } from "../context/SessionContext";
import { validatePrescription } from "../utils/validation";

const createEmptyMedicine = () => ({
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: ""
});

export default function PrescriptionFormScreen({ navigation, route }) {
  const { session } = useSession();
  const { record, prescription } = route.params;
  const [values, setValues] = useState({
    medicalRecordId: record._id,
    patientId: String(record.patientId),
    prescribedDate: prescription?.prescribedDate
      ? new Date(prescription.prescribedDate).toISOString().slice(0, 10)
      : "",
    medicines: prescription?.medicines?.length ? prescription.medicines : [createEmptyMedicine()]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleMedicineChange = (index, field, value) => {
    setValues((current) => {
      const nextMedicines = current.medicines.map((medicine, medicineIndex) =>
        medicineIndex === index ? { ...medicine, [field]: value } : medicine
      );

      return { ...current, medicines: nextMedicines };
    });
  };

  const addMedicine = () => {
    setValues((current) => ({
      ...current,
      medicines: [...current.medicines, createEmptyMedicine()]
    }));
  };

  const removeMedicine = (index) => {
    setValues((current) => ({
      ...current,
      medicines: current.medicines.filter((_, medicineIndex) => medicineIndex !== index)
    }));
  };

  const handleSubmit = async () => {
    const nextErrors = validatePrescription(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      if (prescription?._id) {
        await moduleApi.updatePrescription({
          baseUrl: session.apiBaseUrl,
          token: session.token,
          prescriptionId: prescription._id,
          payload: values
        });
        Alert.alert("Success", "Prescription updated");
      } else {
        await moduleApi.createPrescription({
          baseUrl: session.apiBaseUrl,
          token: session.token,
          payload: values
        });
        Alert.alert("Success", "Prescription created");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!prescription?._id) {
      return;
    }

    try {
      setLoading(true);
      await moduleApi.deletePrescription({
        baseUrl: session.apiBaseUrl,
        token: session.token,
        prescriptionId: prescription._id
      });
      Alert.alert("Deleted", "Prescription deleted");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Delete failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        {prescription ? "Edit prescription" : "Create prescription"}
      </Text>

      <FormInput label="Medical Record ID" value={values.medicalRecordId} onChangeText={() => {}} error={errors.medicalRecordId} editable={false} />
      <FormInput label="Patient ID" value={values.patientId} onChangeText={() => {}} error={errors.patientId} editable={false} />
      <FormInput
        label="Prescribed Date"
        value={values.prescribedDate}
        onChangeText={(value) => setValues((current) => ({ ...current, prescribedDate: value }))}
        error={errors.prescribedDate}
        placeholder="2026-04-12"
      />

      {values.medicines.map((medicine, index) => (
        <MedicineFields
          key={`${index}-${medicine.medicineName}`}
          item={medicine}
          index={index}
          errors={errors}
          onChange={handleMedicineChange}
          onRemove={removeMedicine}
          canRemove={values.medicines.length > 1}
        />
      ))}

      <PrimaryButton title="Add Another Medicine" onPress={addMedicine} variant="secondary" />
      <PrimaryButton title={prescription ? "Update Prescription" : "Create Prescription"} onPress={handleSubmit} loading={loading} />
      {prescription ? <PrimaryButton title="Delete Prescription" onPress={handleDelete} /> : null}
    </ScreenContainer>
  );
}
