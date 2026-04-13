import React, { useEffect, useState } from "react";
import { Alert, Text } from "react-native";

import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { moduleApi } from "../api/moduleApi";
import { useSession } from "../context/SessionContext";
import { validateReport } from "../utils/validation";

export default function ReportViewScreen({ route }) {
  const { session } = useSession();
  const routeReport = route.params?.report || null;
  const record = route.params?.record || null;
  const reportId = route.params?.reportId || routeReport?._id || null;

  const [report, setReport] = useState(routeReport);
  const [values, setValues] = useState({
    medicalRecordId: record?._id || routeReport?.medicalRecordId || "",
    patientName: routeReport?.patientDetails?.name || "",
    patientAge: routeReport?.patientDetails?.age ? String(routeReport.patientDetails.age) : "",
    patientGender: routeReport?.patientDetails?.gender || "",
    contactNumber: routeReport?.patientDetails?.contactNumber || "",
    appointmentId: record?.appointmentId || routeReport?.appointmentDetails?.appointmentId || "",
    appointmentDate: routeReport?.appointmentDetails?.appointmentDate
      ? new Date(routeReport.appointmentDetails.appointmentDate).toISOString().slice(0, 10)
      : "",
    doctorName: record?.doctorName || routeReport?.appointmentDetails?.doctorName || "",
    appointmentStatus: routeReport?.appointmentDetails?.appointmentStatus || "completed"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      if (!reportId || routeReport) {
        return;
      }

      try {
        setLoading(true);
        const data = await moduleApi.getReportById({
          baseUrl: session.apiBaseUrl,
          token: session.token,
          reportId
        });
        setReport(data);
      } catch (error) {
        Alert.alert("Load failed", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [reportId, routeReport, session.apiBaseUrl, session.token]);

  const handleGenerate = async () => {
    const nextErrors = validateReport(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const data = await moduleApi.generateReport({
        baseUrl: session.apiBaseUrl,
        token: session.token,
        payload: {
          medicalRecordId: values.medicalRecordId,
          patientDetails: {
            name: values.patientName,
            age: values.patientAge ? Number(values.patientAge) : undefined,
            gender: values.patientGender,
            contactNumber: values.contactNumber
          },
          appointmentDetails: {
            appointmentId: values.appointmentId,
            appointmentDate: values.appointmentDate || undefined,
            doctorName: values.doctorName,
            appointmentStatus: values.appointmentStatus
          }
        }
      });
      setReport(data);
      Alert.alert("Success", "Report generated");
    } catch (error) {
      Alert.alert("Generate failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (report) {
    return (
      <ScreenContainer>
        <InfoCard
          title="Patient Details"
          lines={[
            `Name: ${report.patientDetails.name}`,
            `Age: ${report.patientDetails.age || "-"}`,
            `Gender: ${report.patientDetails.gender || "-"}`,
            `Contact: ${report.patientDetails.contactNumber || "-"}`
          ]}
        />
        <InfoCard
          title="Appointment Details"
          lines={[
            `Appointment ID: ${report.appointmentDetails.appointmentId}`,
            `Appointment Date: ${
              report.appointmentDetails.appointmentDate
                ? new Date(report.appointmentDetails.appointmentDate).toLocaleDateString()
                : "-"
            }`,
            `Doctor: ${report.appointmentDetails.doctorName || "-"}`,
            `Status: ${report.appointmentDetails.appointmentStatus || "-"}`
          ]}
        />
        <InfoCard
          title="Clinical Summary"
          lines={[
            `Diagnosis: ${report.diagnosis}`,
            `Treatment Notes: ${report.treatmentNotes || "-"}`,
            `Generated: ${new Date(report.generatedDate).toLocaleString()}`
          ]}
        />
        <InfoCard title="Prescription Summary" lines={String(report.prescriptionSummary).split("\n")} />
        {record ? <PrimaryButton title="Regenerate Report" onPress={() => setReport(null)} variant="secondary" /> : null}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 14 }}>Generate report</Text>
      <FormInput
        label="Medical Record ID"
        value={values.medicalRecordId}
        onChangeText={(value) => setValues((current) => ({ ...current, medicalRecordId: value }))}
        error={errors.medicalRecordId}
      />
      <FormInput
        label="Patient Name"
        value={values.patientName}
        onChangeText={(value) => setValues((current) => ({ ...current, patientName: value }))}
        error={errors.patientName}
      />
      <FormInput
        label="Patient Age"
        value={values.patientAge}
        onChangeText={(value) => setValues((current) => ({ ...current, patientAge: value }))}
      />
      <FormInput
        label="Patient Gender"
        value={values.patientGender}
        onChangeText={(value) => setValues((current) => ({ ...current, patientGender: value }))}
      />
      <FormInput
        label="Contact Number"
        value={values.contactNumber}
        onChangeText={(value) => setValues((current) => ({ ...current, contactNumber: value }))}
      />
      <FormInput
        label="Appointment ID"
        value={values.appointmentId}
        onChangeText={(value) => setValues((current) => ({ ...current, appointmentId: value }))}
        error={errors.appointmentId}
      />
      <FormInput
        label="Appointment Date"
        value={values.appointmentDate}
        onChangeText={(value) => setValues((current) => ({ ...current, appointmentDate: value }))}
        placeholder="2026-04-12"
      />
      <FormInput
        label="Doctor Name"
        value={values.doctorName}
        onChangeText={(value) => setValues((current) => ({ ...current, doctorName: value }))}
      />
      <FormInput
        label="Appointment Status"
        value={values.appointmentStatus}
        onChangeText={(value) => setValues((current) => ({ ...current, appointmentStatus: value }))}
      />
      <PrimaryButton title="Generate Report" onPress={handleGenerate} loading={loading} />
    </ScreenContainer>
  );
}
