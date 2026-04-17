import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function MedicalReportListScreen({ navigation }) {
  const { reports, deleteReport } = useAppData();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const canEditReports = currentUser?.role === "admin";

  const filteredReports = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesQuery =
        !normalizedQuery ||
        report.patientName.toLowerCase().includes(normalizedQuery) ||
        report.id.toLowerCase().includes(normalizedQuery);
      const matchesDoctor = !doctorFilter.trim() || report.doctorName.toLowerCase().includes(doctorFilter.trim().toLowerCase());
      const matchesDate = !dateFilter.trim() || report.reportDate === dateFilter.trim();

      return matchesQuery && matchesDoctor && matchesDate;
    });
  }, [reports, searchQuery, doctorFilter, dateFilter]);

  const handleDelete = (report) => {
    Alert.alert("Delete medical report", `Delete report ${report.id}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReport(report.rawId);
          } catch (error) {
            Alert.alert("Delete failed", error.message);
          }
        }
      }
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Medical Reports</Text>
      <Text style={styles.subtitle}>Manage patient reports with fast search, doctor filtering, and detail views.</Text>

      <View style={styles.panel}>
        <FormInput
          label="Search by patient or report ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search report"
        />
        <FormInput
          label="Filter by doctor"
          value={doctorFilter}
          onChangeText={setDoctorFilter}
          placeholder="Doctor name"
        />
        <FormInput label="Filter by date" value={dateFilter} onChangeText={setDateFilter} placeholder="YYYY-MM-DD" />
      </View>

      {canEditReports ? <PrimaryButton title="Add Medical Report" onPress={() => navigation.navigate("ReportForm")} /> : null}

      {filteredReports.map((report) => (
        <InfoCard
          key={report.id}
          title={`${report.patientName} • ${report.id}`}
          lines={[
            `Doctor: ${report.doctorName}`,
            `Diagnosis: ${report.diagnosis}`,
            `Symptoms: ${report.symptoms}`,
            `Date: ${report.reportDate}`
          ]}
        >
          <PrimaryButton title="View Report" onPress={() => navigation.navigate("ReportDetail", { reportId: report.rawId })} />
          {canEditReports ? (
            <PrimaryButton
              title="Edit Report"
              onPress={() => navigation.navigate("ReportForm", { reportId: report.rawId })}
              variant="secondary"
            />
          ) : null}
          {canEditReports ? <PrimaryButton title="Delete Report" onPress={() => handleDelete(report)} variant="ghost" /> : null}
        </InfoCard>
      ))}
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
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#dde8ee"
  }
});
