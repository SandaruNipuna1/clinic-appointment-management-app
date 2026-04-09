import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { cancelAppointment, fetchAppointments, updateAppointment } from "../services/appointmentApi";
import { DOCTOR_NAME_BY_ID, PATIENT_NAME_BY_ID } from "../data/demoProfiles";
import { validateAppointmentInputs } from "../utils/appointmentValidation";

const AppointmentHistoryScreen = ({ refreshToken, onAppointmentUpdated, onAppointmentCancelled }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editForm, setEditForm] = useState({
    appointmentDate: "",
    appointmentTime: ""
  });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchAppointments();

      if (!result.success) {
        setError(result.message || "Unable to load appointments.");
        return;
      }

      setAppointments(result.data || []);
    } catch (_error) {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [refreshToken]);

  const handleCancel = async (appointmentId) => {
    try {
      setActionId(appointmentId);
      const result = await cancelAppointment(appointmentId);

      if (!result.success) {
        Alert.alert("Cancel failed", result.message || "Unable to cancel appointment.");
        return;
      }

      Alert.alert("Success", "Appointment cancelled successfully.");
      onAppointmentCancelled?.("Appointment cancelled successfully.");
      loadAppointments();
    } catch (_error) {
      Alert.alert("Network error", "Could not connect to backend.");
    } finally {
      setActionId("");
    }
  };

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setEditForm({
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime
    });
  };

  const closeEditModal = () => {
    setEditingAppointment(null);
    setEditForm({
      appointmentDate: "",
      appointmentTime: ""
    });
  };

  const handleUpdate = async () => {
    if (!editingAppointment) {
      return;
    }

    const validationMessage = validateAppointmentInputs({
      appointmentDate: editForm.appointmentDate,
      appointmentTime: editForm.appointmentTime,
      requireReason: false
    });

    if (validationMessage) {
      Alert.alert("Invalid appointment details", validationMessage);
      return;
    }

    try {
      setActionId(editingAppointment._id);
      const result = await updateAppointment(editingAppointment._id, editForm);

      if (!result.success) {
        Alert.alert("Update failed", result.message || "Unable to update appointment.");
        return;
      }

      const doctorName = DOCTOR_NAME_BY_ID[result.data.doctorId] || "doctor";
      onAppointmentUpdated?.(`Appointment updated with ${doctorName} for ${result.data.appointmentDate} at ${result.data.appointmentTime}.`);
      Alert.alert("Success", "Appointment updated successfully.");
      closeEditModal();
      loadAppointments();
    } catch (_error) {
      Alert.alert("Network error", "Could not connect to backend.");
    } finally {
      setActionId("");
    }
  };

  return (
    <View>
      <Text style={styles.heading}>Recent Appointments</Text>
      <Text style={styles.subheading}>View, update, or cancel bookings.</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={loadAppointments}>
        <Text style={styles.refreshLabel}>Refresh</Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator size="small" color="#1d6ef2" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && appointments.length === 0 && !error ? (
        <Text style={styles.empty}>No appointments found yet.</Text>
      ) : null}
      {appointments.map((appointment) => (
        <View key={appointment._id} style={styles.item}>
          <Text style={styles.doctor}>{DOCTOR_NAME_BY_ID[appointment.doctorId] || `Doctor ID: ${appointment.doctorId}`}</Text>
          <Text style={styles.meta}>{PATIENT_NAME_BY_ID[appointment.patientId] || `Patient ID: ${appointment.patientId}`}</Text>
          <Text style={styles.meta}>
            {appointment.appointmentDate} at {appointment.appointmentTime}
          </Text>
          <Text style={styles.meta}>Reason: {appointment.reason}</Text>
          <Text style={[styles.status, appointment.status === "cancelled" && styles.cancelledStatus]}>{appointment.status}</Text>
          {appointment.status !== "cancelled" ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(appointment)} disabled={actionId === appointment._id}>
                <Text style={styles.editLabel}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(appointment._id)} disabled={actionId === appointment._id}>
                <Text style={styles.cancelLabel}>{actionId === appointment._id ? "Cancelling..." : "Cancel"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ))}
      <Modal visible={Boolean(editingAppointment)} transparent animationType="slide" onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Appointment</Text>
            <Text style={styles.modalText}>Change the appointment date and time.</Text>
            <Text style={styles.modalLabel}>New Date</Text>
            <TextInput
              value={editForm.appointmentDate}
              onChangeText={(value) => setEditForm((current) => ({ ...current, appointmentDate: value }))}
              placeholder="2026-04-10"
              placeholderTextColor="#8ea1bb"
              style={styles.modalInput}
            />
            <Text style={styles.modalLabel}>New Time</Text>
            <TextInput
              value={editForm.appointmentTime}
              onChangeText={(value) => setEditForm((current) => ({ ...current, appointmentTime: value }))}
              placeholder="10:30"
              placeholderTextColor="#8ea1bb"
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={closeEditModal}>
                <Text style={styles.modalSecondaryLabel}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleUpdate} disabled={actionId === editingAppointment?._id}>
                <Text style={styles.modalPrimaryLabel}>{actionId === editingAppointment?._id ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    color: "#132238"
  },
  subheading: {
    color: "#647892",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12
  },
  item: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e4edf7"
  },
  refreshButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#e6f2ee"
  },
  refreshLabel: {
    color: "#156c5c",
    fontWeight: "700"
  },
  doctor: {
    fontSize: 16,
    fontWeight: "700",
    color: "#132238"
  },
  meta: {
    color: "#4d637b",
    marginTop: 4
  },
  status: {
    marginTop: 8,
    color: "#1d6ef2",
    fontWeight: "600",
    textTransform: "capitalize",
    alignSelf: "flex-start",
    backgroundColor: "#e8f1ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden"
  },
  cancelledStatus: {
    color: "#c62828",
    backgroundColor: "#ffe7e7"
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12
  },
  editButton: {
    alignSelf: "flex-start",
    backgroundColor: "#e8f1ff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  editLabel: {
    color: "#1d6ef2",
    fontWeight: "700"
  },
  cancelButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ffe7e7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  cancelLabel: {
    color: "#c62828",
    fontWeight: "700"
  },
  error: {
    color: "#c62828",
    marginBottom: 10
  },
  empty: {
    color: "#4d637b"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 39, 71, 0.35)",
    justifyContent: "center",
    padding: 20
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#132238"
  },
  modalText: {
    marginTop: 8,
    color: "#647892",
    lineHeight: 22,
    marginBottom: 16
  },
  modalLabel: {
    color: "#29415f",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#c8d7eb",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    backgroundColor: "#f7fbff",
    color: "#132238",
    fontSize: 16
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#eef4fb",
    alignItems: "center"
  },
  modalSecondaryLabel: {
    color: "#29415f",
    fontWeight: "700"
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#0f2747",
    alignItems: "center"
  },
  modalPrimaryLabel: {
    color: "#ffffff",
    fontWeight: "700"
  }
});

export default AppointmentHistoryScreen;
