import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Patient View</Text>
        <Text style={styles.heroTitle}>My records and reports</Text>
        <Text style={styles.heroText}>Signed in as patient: {session.userId}</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actionsWrap}>
        <PrimaryButton title="Refresh History" onPress={loadHistory} variant="secondary" />
        <PrimaryButton title="Browse Doctors" onPress={() => navigation.navigate("Doctors")} variant="ghost" />
        <PrimaryButton title="Session Setup" onPress={() => navigation.navigate("SessionSetup")} variant="ghost" />
        <PrimaryButton
          title="Reset Demo Session"
          onPress={async () => {
            await clearSession();
            navigation.reset({ index: 0, routes: [{ name: "PatientHistory" }] });
          }}
          variant="ghost"
        />
      </View>

      <Text style={styles.sectionTitle}>Medical Records</Text>
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

      <Text style={styles.sectionTitle}>Prescriptions</Text>
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

      <Text style={styles.sectionTitle}>Reports</Text>
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

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#fffdf7",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#f0e6c8"
  },
  heroEyebrow: {
    color: "#a16207",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#1c3139",
    marginBottom: 8
  },
  heroText: {
    color: "#687881",
    fontSize: 15
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 12
  },
  actionsWrap: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#17303b",
    marginTop: 10,
    marginBottom: 12
  }
});
