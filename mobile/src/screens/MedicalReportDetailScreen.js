// This screen displays a single medical report in detail.
// It shows diagnosis, treatment, and allows attachment upload when the user can perform that action.
// Users can also open the attached document and navigate back to the report list.

import React, { useMemo } from "react";
import { Alert, Linking, StyleSheet, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function MedicalReportDetailScreen({ navigation, route }) {
  const { reports, uploadReportAttachment } = useAppData();
  const { currentUser, apiBaseUrl } = useAuth();
  const report = useMemo(() => reports.find((item) => item.rawId === route.params?.reportId), [reports, route.params?.reportId]);
  const canEditReports = currentUser?.role === "admin";

  const handleUploadAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ["application/pdf", "image/*"]
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      await uploadReportAttachment(report.rawId, result.assets[0]);
      Alert.alert("Uploaded", "Attachment uploaded successfully.");
    } catch (error) {
      Alert.alert("Upload failed", error.message);
    }
  };

  const handleOpenAttachment = async () => {
    if (!report?.attachmentUrl) {
      return;
    }

    const fileUrl = report.attachmentUrl.startsWith("http")
      ? report.attachmentUrl
      : `${apiBaseUrl.replace(/\/api$/, "")}${report.attachmentUrl}`;

    const canOpen = await Linking.canOpenURL(fileUrl);

    if (!canOpen) {
      Alert.alert("Open failed", "This attachment could not be opened on this device.");
      return;
    }

    await Linking.openURL(fileUrl);
  };

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
          `Additional Notes: ${report.additionalNotes || "-"}`,
          `Attachment: ${report.attachmentName || "No file uploaded"}`
        ]}
      />
      {report.attachmentUrl ? <PrimaryButton title="Open Attachment" onPress={handleOpenAttachment} /> : null}
      {canEditReports ? (
        <PrimaryButton title="Edit Report" onPress={() => navigation.navigate("ReportForm", { reportId: report.rawId })} />
      ) : null}
      {canEditReports ? <PrimaryButton title="Upload Attachment" onPress={handleUploadAttachment} variant="secondary" /> : null}
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
