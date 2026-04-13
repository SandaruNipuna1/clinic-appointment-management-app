import React, { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useSession } from "../context/SessionContext";
import { moduleApi } from "../api/moduleApi";

export default function AdminMedicalRecordListScreen({ navigation }) {
  const { session, clearSession } = useSession();
  const [patientId, setPatientId] = useState("");
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPatientData = async (requestedPatientId = patientId) => {
    if (!requestedPatientId.trim()) {
      setError("Enter a patientId to load records");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [medicalRecordData, prescriptionData, reportData] = await Promise.all([
        moduleApi.getMedicalRecordsByPatient({
          baseUrl: session.apiBaseUrl,
          token: session.token,
          patientId: requestedPatientId.trim()
        }),
        moduleApi.getPrescriptionsByPatient({
          baseUrl: session.apiBaseUrl,
          token: session.token,
          patientId: requestedPatientId.trim()
        }),
        moduleApi.getReportsByPatient({
          baseUrl: session.apiBaseUrl,
          token: session.token,
          patientId: requestedPatientId.trim()
        })
      ]);

      setRecords(medicalRecordData);
      setPrescriptions(prescriptionData);
      setReports(reportData);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (patientId.trim()) {
        loadPatientData(patientId);
      }
    }, [patientId])
  );

  const getPrescriptionForRecord = (recordId) =>
    prescriptions.find((item) => item.medicalRecordId === recordId || item.medicalRecordId?._id === recordId);

  const getReportForRecord = (recordId) =>
    reports.find((item) => item.medicalRecordId === recordId || item.medicalRecordId?._id === recordId);

  const handleDelete = async (recordId) => {
    try {
      setLoading(true);
      await moduleApi.deleteMedicalRecord({
        baseUrl: session.apiBaseUrl,
        token: session.token,
        recordId
      });
      await loadPatientData(patientId);
    } catch (apiError) {
      Alert.alert("Delete failed", apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Admin module dashboard</Text>
      <Text style={{ color: "#475569", marginBottom: 16 }}>
        Search a patient by `patientId`, then create records, add prescriptions, and open reports.
      </Text>

      <FormInput label="Patient ID" value={patientId} onChangeText={setPatientId} error={error} />
      <PrimaryButton title="Load Patient Records" onPress={() => loadPatientData()} loading={loading} />
      <PrimaryButton
        title="Create New Medical Record"
        onPress={() => navigation.navigate("CreateMedicalRecord", { patientId })}
        variant="secondary"
      />
      <PrimaryButton
        title="Go To Session Setup"
        onPress={() => navigation.navigate("SessionSetup")}
        variant="secondary"
      />
      <PrimaryButton
        title="Clear Session"
        onPress={async () => {
          await clearSession();
          navigation.reset({ index: 0, routes: [{ name: "SessionSetup" }] });
        }}
        variant="secondary"
      />

      <View style={{ marginTop: 12 }}>
        {records.map((record) => {
          const prescription = getPrescriptionForRecord(record._id);
          const report = getReportForRecord(record._id);

          return (
            <InfoCard
              key={record._id}
              title={record.diagnosis}
              lines={[
                `Doctor: ${record.doctorName}`,
                `Visit Date: ${new Date(record.visitDate).toLocaleDateString()}`,
                `Status: ${record.status}`,
                `Appointment: ${record.appointmentId}`
              ]}
            >
              <PrimaryButton
                title="Edit Medical Record"
                onPress={() => navigation.navigate("EditMedicalRecord", { record })}
                variant="secondary"
              />
              <PrimaryButton
                title={prescription ? "Edit Prescription" : "Add Prescription"}
                onPress={() =>
                  navigation.navigate("PrescriptionForm", {
                    record,
                    prescription
                  })
                }
                variant="secondary"
              />
              <PrimaryButton
                title={report ? "Open Report" : "Generate Report"}
                onPress={() =>
                  navigation.navigate("ReportView", {
                    record,
                    report
                  })
                }
                variant="secondary"
              />
              <PrimaryButton title="Delete Record" onPress={() => handleDelete(record._id)} />
            </InfoCard>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
