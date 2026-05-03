// This screen shows the list of doctor schedules.
// It supports filtering schedules by doctor name and day of the week.
// Admin and receptionist users can delete schedules from this screen.

import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import FormInput from "../components/FormInput";
import InfoCard from "../components/InfoCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const DAY_FILTER_OPTIONS = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ScheduleListScreen({ navigation }) {
  const { schedules, deleteSchedule } = useAppData();
  const { currentUser } = useAuth();
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("All");
  const canManageSchedules = ["admin", "receptionist"].includes(currentUser?.role);

  const filteredSchedules = useMemo(() => {
    const normalizedDoctor = doctorFilter.trim().toLowerCase();
    const normalizedDay = dayFilter === "All" ? "" : dayFilter.trim().toLowerCase();

    return schedules.filter((schedule) => {
      const matchesDoctor = !normalizedDoctor || schedule.doctorName.toLowerCase().includes(normalizedDoctor);
      const matchesDay = !normalizedDay || schedule.availableDay.toLowerCase().includes(normalizedDay);
      return matchesDoctor && matchesDay;
    });
  }, [dayFilter, doctorFilter, schedules]);

  const handleDelete = (schedule) => {
    Alert.alert("Delete schedule", `Delete schedule ${schedule.id}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSchedule(schedule.rawId);
          } catch (error) {
            Alert.alert("Delete failed", error.message);
          }
        }
      }
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Schedule / Availability Management</Text>
      <Text style={styles.subtitle}>View schedules and filter availability by doctor or day.</Text>

      <View style={styles.panel}>
        <FormInput
          label="Filter by doctor"
          value={doctorFilter}
          onChangeText={setDoctorFilter}
          placeholder="Doctor name"
        />
        <Text style={styles.filterLabel}>Filter by day</Text>
        <View style={styles.filterWrap}>
          {DAY_FILTER_OPTIONS.map((option) => (
            <PrimaryButton
              key={option}
              title={option}
              onPress={() => setDayFilter(option)}
              variant={dayFilter === option ? "primary" : "ghost"}
            />
          ))}
        </View>
      </View>

      {canManageSchedules ? (
        <PrimaryButton title="Add New Schedule" onPress={() => navigation.navigate("ScheduleForm")} />
      ) : null}

      {filteredSchedules.map((schedule) => (
        <InfoCard
          key={schedule.id}
          title={`${schedule.doctorName} • ${schedule.id}`}
          lines={[
            `Days: ${schedule.availableDay}`,
            `Time: ${schedule.startTime} - ${schedule.endTime}`,
            `Status: ${schedule.status}`
          ]}
        >
          {canManageSchedules ? (
            <PrimaryButton
              title="Edit Schedule"
              onPress={() => navigation.navigate("ScheduleForm", { scheduleId: schedule.rawId })}
              variant="secondary"
            />
          ) : null}
          {canManageSchedules ? (
            <PrimaryButton title="Delete Schedule" onPress={() => handleDelete(schedule)} variant="ghost" />
          ) : null}
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
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#4b6972",
    marginBottom: 10
  },
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  }
});
