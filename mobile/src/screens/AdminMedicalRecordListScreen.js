import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Admin Workspace</Text>
        <Text style={styles.heroTitle}>Clinic operations dashboard</Text>
        <Text style={styles.heroText}>
          Review patient histories, issue prescriptions, and keep doctor availability up to date from one calm command
          center.
        </Text>
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{records.length}</Text>
            <Text style={styles.metricLabel}>Loaded Records</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{prescriptions.length + reports.length}</Text>
            <Text style={styles.metricLabel}>Linked Items</Text>
          </View>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Patient lookup</Text>
        <Text style={styles.panelText}>Enter a patient ID to open records, prescriptions, and reports together.</Text>
        <FormInput label="Patient ID" value={patientId} onChangeText={setPatientId} error={error} />
        <PrimaryButton title="Load Patient Records" onPress={() => loadPatientData()} loading={loading} />
      </View>

      <View style={styles.quickActions}>
        <PrimaryButton
          title="Create New Medical Record"
          onPress={() => navigation.navigate("CreateMedicalRecord", { patientId })}
          variant="secondary"
        />
        <PrimaryButton title="Manage Doctors" onPress={() => navigation.navigate("Doctors")} variant="secondary" />
        <PrimaryButton title="Session Settings" onPress={() => navigation.navigate("SessionSetup")} variant="ghost" />
        <PrimaryButton
          title="Reset Demo Session"
          onPress={async () => {
            await clearSession();
            navigation.reset({ index: 0, routes: [{ name: "AdminMedicalRecords" }] });
          }}
          variant="ghost"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Patient overview</Text>
        <Text style={styles.sectionCaption}>
          {patientId.trim() ? `Live view for ${patientId}` : "Load a patient to populate this area"}
        </Text>
      </View>

      <View style={styles.recordsWrap}>
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

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#123b46",
    borderRadius: 30,
    padding: 22,
    marginBottom: 18,
    shadowColor: "#123b46",
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6
  },
  heroEyebrow: {
    color: "#9be3d7",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10
  },
  heroTitle: {
    color: "#f4fffd",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 10
  },
  heroText: {
    color: "#c6dde3",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18
  },
  metricRow: {
    flexDirection: "row",
    gap: 12
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#1b4c58",
    borderRadius: 20,
    padding: 14
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4
  },
  metricLabel: {
    color: "#b8d5d9",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  panel: {
    backgroundColor: "#fcfffe",
    borderRadius: 26,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#deeaef"
  },
  panelTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 6
  },
  panelText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5d727b",
    marginBottom: 14
  },
  quickActions: {
    marginBottom: 18
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 4
  },
  sectionCaption: {
    color: "#60757d",
    fontSize: 14
  },
  recordsWrap: {
    marginTop: 2
  }
});
