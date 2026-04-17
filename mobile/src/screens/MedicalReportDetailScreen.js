import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";

export default function MedicalReportDetailScreen({ navigation, route }) {
  const { reports } = useAppData();
  const report = useMemo(() => reports.find((item) => item.id === route.params?.reportId), [reports, route.params?.reportId]);

  if (!report) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Report not found</Text>
        <PrimaryButton title="Back to Reports" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Medical report details</Text>
      <InfoCard
        title={`${report.patientName} • ${report.id}`}
        lines={[
          `Doctor: ${report.doctorName}`,
          `Diagnosis: ${report.diagnosis}`,
          `Symptoms: ${report.symptoms}`,
          `Treatment: ${report.treatment}`,
          `Prescription Note: ${report.prescriptionNote}`,
          `Report Date: ${report.reportDate}`,
          `Additional Notes: ${report.additionalNotes || "-"}`
        ]}
      />
      <PrimaryButton title="Edit Report" onPress={() => navigation.navigate("ReportForm", { reportId: report.id })} />
      <PrimaryButton title="Back to Reports" onPress={() => navigation.goBack()} variant="ghost" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17303b",
    marginBottom: 12
  }
});
