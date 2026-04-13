import React, { useCallback, useState } from "react";
import { Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { moduleApi } from "../api/moduleApi";
import { useSession } from "../context/SessionContext";

export default function PatientRecordsHistoryScreen({ navigation }) {
  const { session, clearSession } = useSession();
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setError("");

      const [medicalRecordData, prescriptionData, reportData] = await Promise.all([
        moduleApi.getMyMedicalRecords({
          baseUrl: session.apiBaseUrl,
          token: session.token
        }),
        moduleApi.getMyPrescriptions({
          baseUrl: session.apiBaseUrl,
          token: session.token
        }),
        moduleApi.getMyReports({
          baseUrl: session.apiBaseUrl,
          token: session.token
        })
      ]);

      setRecords(medicalRecordData);
      setPrescriptions(prescriptionData);
      setReports(reportData);
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>My records and reports</Text>
      <Text style={{ color: "#475569", marginBottom: 16 }}>
        Signed in as patient: {session.userId}
      </Text>

      {error ? <Text style={{ color: "#dc2626", marginBottom: 12 }}>{error}</Text> : null}

      <PrimaryButton title="Refresh History" onPress={loadHistory} variant="secondary" />
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

      <Text style={{ fontSize: 17, fontWeight: "700", marginVertical: 12 }}>Medical Records</Text>
      {records.map((record) => (
        <InfoCard
          key={record._id}
          title={record.diagnosis}
          lines={[
            `Doctor: ${record.doctorName}`,
            `Symptoms: ${record.symptoms}`,
            `Treatment: ${record.treatmentNotes || "-"}`,
            `Visit Date: ${new Date(record.visitDate).toLocaleDateString()}`
          ]}
        />
      ))}

      <Text style={{ fontSize: 17, fontWeight: "700", marginVertical: 12 }}>Prescriptions</Text>
      {prescriptions.map((prescription) => (
        <InfoCard
          key={prescription._id}
          title={`Prescription - ${new Date(prescription.prescribedDate).toLocaleDateString()}`}
          lines={prescription.medicines.map(
            (medicine) =>
              `${medicine.medicineName} | ${medicine.dosage} | ${medicine.frequency} | ${medicine.duration}`
          )}
        />
      ))}

      <Text style={{ fontSize: 17, fontWeight: "700", marginVertical: 12 }}>Reports</Text>
      {reports.map((report) => (
        <InfoCard
          key={report._id}
          title={report.patientDetails.name}
          lines={[
            `Diagnosis: ${report.diagnosis}`,
            `Generated: ${new Date(report.generatedDate).toLocaleString()}`
          ]}
        >
          <PrimaryButton
            title="Open Report"
            onPress={() =>
              navigation.navigate("ReportView", {
                reportId: report._id
              })
            }
            variant="secondary"
          />
        </InfoCard>
      ))}
    </ScreenContainer>
  );
}
