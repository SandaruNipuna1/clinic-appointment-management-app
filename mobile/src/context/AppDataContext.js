import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { moduleApi } from "../api/moduleApi";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
};

const formatAvailability = (doctor) => {
  if (doctor.availabilityLabel) {
    return doctor.availabilityLabel;
  }

  if (!Array.isArray(doctor.availability) || doctor.availability.length === 0) {
    return "";
  }

  return doctor.availability
    .map((entry) => `${entry.day} ${entry.startTime}-${entry.endTime}`)
    .join(", ");
};

const mapDoctor = (doctor) => ({
  rawId: doctor._id,
  id: doctor.doctorCode || doctor._id,
  name: doctor.name,
  specialization: doctor.specialization,
  phone: doctor.phone,
  email: doctor.email,
  availability: formatAvailability(doctor),
  availabilityDay: doctor.availability?.[0]?.day || "",
  availabilityStartTime: doctor.availability?.[0]?.startTime || "",
  availabilityEndTime: doctor.availability?.[0]?.endTime || "",
  roomNumber: doctor.roomNumber || "",
});

const mapAppointment = (appointment) => ({
  rawId: appointment._id,
  id: appointment.appointmentCode || appointment._id,
  patientName: appointment.patientName,
  patientId: appointment.patientId || null,
  doctorId: appointment.doctorId,
  doctorName: appointment.doctorName,
  date: formatDate(appointment.date),
  time: appointment.time,
  reason: appointment.reason,
  status: appointment.status
});

const mapReport = (report) => ({
  rawId: report._id,
  id: report.reportCode || report._id,
  patientName: report.patientName,
  patientId: report.patientId || null,
  doctorName: report.doctorName,
  diagnosis: report.diagnosis,
  symptoms: report.symptoms,
  treatment: report.treatment,
  prescriptionNote: report.prescriptionNote,
  reportDate: formatDate(report.reportDate),
  additionalNotes: report.additionalNotes || ""
});

const mapPatient = (patient) => ({
  rawId: patient._id,
  id: patient.patientCode || patient._id,
  name: patient.name,
  dateOfBirth: formatDate(patient.dateOfBirth),
  gender: patient.gender,
  phone: patient.phone,
  email: patient.email,
  address: patient.address
});

const mapSchedule = (schedule) => ({
  rawId: schedule._id,
  id: schedule.scheduleCode || schedule._id,
  doctorName: schedule.doctorName,
  availableDays: Array.isArray(schedule.availableDays)
    ? schedule.availableDays
    : schedule.availableDay
      ? [schedule.availableDay]
      : [],
  availableDay: Array.isArray(schedule.availableDays)
    ? schedule.availableDays.join(", ")
    : schedule.availableDay || "",
  startTime: schedule.startTime,
  endTime: schedule.endTime,
  status: schedule.status
});

const EMPTY_STATE = {
  doctors: [],
  patients: [],
  appointments: [],
  reports: [],
  schedules: []
};

export function AppDataProvider({ children }) {
  const { apiBaseUrl, token, currentUser, isReady: isAuthReady } = useAuth();
  const [state, setState] = useState(EMPTY_STATE);
  const [isReady, setIsReady] = useState(false);

  const refreshData = useCallback(async () => {
    if (!token) {
      setState(EMPTY_STATE);
      setIsReady(true);
      return;
    }

    const results = await Promise.allSettled([
      moduleApi.getDoctors({ baseUrl: apiBaseUrl, token }),
      moduleApi.getPatients({ baseUrl: apiBaseUrl, token }).catch((error) => {
        if (currentUser?.role === "patient") {
          return [];
        }
        throw error;
      }),
      moduleApi.getAppointments({ baseUrl: apiBaseUrl, token }),
      moduleApi.getMedicalReports({ baseUrl: apiBaseUrl, token }),
      moduleApi.getSchedules({ baseUrl: apiBaseUrl, token })
    ]);

    const [doctorResult, patientResult, appointmentResult, reportResult, scheduleResult] = results;

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const labels = ["doctors", "patients", "appointments", "reports", "schedules"];
        console.warn(`Failed to load ${labels[index]}`, result.reason);
      }
    });

    setState({
      doctors: doctorResult.status === "fulfilled" ? doctorResult.value.map(mapDoctor) : [],
      patients: patientResult.status === "fulfilled" ? patientResult.value.map(mapPatient) : [],
      appointments: appointmentResult.status === "fulfilled" ? appointmentResult.value.map(mapAppointment) : [],
      reports: reportResult.status === "fulfilled" ? reportResult.value.map(mapReport) : [],
      schedules: scheduleResult.status === "fulfilled" ? scheduleResult.value.map(mapSchedule) : []
    });
    setIsReady(true);
  }, [apiBaseUrl, currentUser?.role, token]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthReady) {
        return;
      }

      try {
        await refreshData();
      } catch (error) {
        console.warn("Failed to load app data", error);
        setState(EMPTY_STATE);
        setIsReady(true);
      }
    };

    load();
  }, [isAuthReady, refreshData]);

  const upsertDoctor = async (doctor) => {
    const availability = doctor.availabilityDay && doctor.availabilityStartTime && doctor.availabilityEndTime
      ? [
          {
            day: doctor.availabilityDay.trim(),
            startTime: doctor.availabilityStartTime.trim(),
            endTime: doctor.availabilityEndTime.trim()
          }
        ]
      : [];

    const payload = {
      name: doctor.name.trim(),
      specialization: doctor.specialization.trim(),
      phone: doctor.phone.trim(),
      email: doctor.email.trim().toLowerCase(),
      availability,
      roomNumber: doctor.roomNumber.trim()
    };

    const savedDoctor = doctor.rawId
      ? await moduleApi.updateDoctor({
          baseUrl: apiBaseUrl,
          token,
          doctorId: doctor.rawId,
          payload
        })
      : await moduleApi.createDoctor({
          baseUrl: apiBaseUrl,
          token,
          payload
        });

    const nextDoctor = mapDoctor(savedDoctor);

    setState((current) => {
      const previousDoctor = current.doctors.find((item) => item.rawId === nextDoctor.rawId);
      const exists = current.doctors.some((item) => item.rawId === nextDoctor.rawId);
      const nextDoctors = exists
        ? current.doctors.map((item) => (item.rawId === nextDoctor.rawId ? nextDoctor : item))
        : [nextDoctor, ...current.doctors];

      const nextAppointments = current.appointments.map((appointment) =>
        appointment.doctorId === nextDoctor.rawId
          ? {
              ...appointment,
              doctorName: nextDoctor.name
            }
          : appointment
      );

      const nextReports = current.reports.map((report) =>
        report.doctorName === previousDoctor?.name || report.doctorName === nextDoctor.name
          ? {
              ...report,
              doctorName: nextDoctor.name
            }
          : report
      );

      return {
        ...current,
        doctors: nextDoctors,
        patients: current.patients,
        appointments: nextAppointments,
        reports: nextReports,
        schedules: current.schedules
      };
    });
  };

  const deleteDoctor = async (doctorId) => {
    await moduleApi.deleteDoctor({
      baseUrl: apiBaseUrl,
      token,
      doctorId
    });

    setState((current) => ({
      ...current,
      doctors: current.doctors.filter((doctor) => doctor.rawId !== doctorId)
    }));
  };

  const upsertPatient = async (patient) => {
    const payload = {
      name: patient.name.trim(),
      dateOfBirth: patient.dateOfBirth.trim(),
      gender: patient.gender.trim(),
      phone: patient.phone.trim(),
      email: patient.email.trim().toLowerCase(),
      address: patient.address.trim()
    };

    const savedPatient = patient.rawId
      ? await moduleApi.updatePatient({
          baseUrl: apiBaseUrl,
          token,
          patientId: patient.rawId,
          payload
        })
      : await moduleApi.createPatient({
          baseUrl: apiBaseUrl,
          token,
          payload
        });

    const nextPatient = mapPatient(savedPatient);

    setState((current) => {
      const exists = current.patients.some((item) => item.rawId === nextPatient.rawId);
      const nextPatients = exists
        ? current.patients.map((item) => (item.rawId === nextPatient.rawId ? nextPatient : item))
        : [nextPatient, ...current.patients];

      return {
        ...current,
        patients: nextPatients
      };
    });
  };

  const deletePatient = async (patientId) => {
    await moduleApi.deletePatient({
      baseUrl: apiBaseUrl,
      token,
      patientId
    });

    setState((current) => ({
      ...current,
      patients: current.patients.filter((patient) => patient.rawId !== patientId)
    }));
  };

  const upsertAppointment = async (appointment) => {
    const selectedDoctor = state.doctors.find((doctor) => doctor.rawId === appointment.doctorId);
    const payload = {
      patientName: appointment.patientName.trim(),
      doctorId: appointment.doctorId,
      date: appointment.date.trim(),
      time: appointment.time.trim(),
      reason: appointment.reason.trim(),
      status: appointment.status.trim(),
      patientId: appointment.patientId || null
    };

    const savedAppointment = appointment.rawId
      ? await moduleApi.updateAppointment({
          baseUrl: apiBaseUrl,
          token,
          appointmentId: appointment.rawId,
          payload
        })
      : await moduleApi.createAppointment({
          baseUrl: apiBaseUrl,
          token,
          payload
        });

    const nextAppointment = mapAppointment(savedAppointment);

    setState((current) => {
      const exists = current.appointments.some((item) => item.rawId === nextAppointment.rawId);
      const nextAppointments = exists
        ? current.appointments.map((item) => (item.rawId === nextAppointment.rawId ? nextAppointment : item))
        : [nextAppointment, ...current.appointments];

      return {
        ...current,
        appointments: nextAppointments.map((item) =>
          item.rawId === nextAppointment.rawId
            ? {
                ...item,
                doctorName: nextAppointment.doctorName || selectedDoctor?.name || item.doctorName
              }
            : item
        )
      };
    });
  };

  const deleteAppointment = async (appointmentId) => {
    await moduleApi.deleteAppointment({
      baseUrl: apiBaseUrl,
      token,
      appointmentId
    });

    setState((current) => ({
      ...current,
      appointments: current.appointments.filter((appointment) => appointment.rawId !== appointmentId)
    }));
  };

  const upsertReport = async (report) => {
    const payload = {
      patientName: report.patientName.trim(),
      patientId: report.patientId || null,
      doctorName: report.doctorName.trim(),
      diagnosis: report.diagnosis.trim(),
      symptoms: report.symptoms.trim(),
      treatment: report.treatment.trim(),
      prescriptionNote: report.prescriptionNote.trim(),
      reportDate: report.reportDate.trim(),
      additionalNotes: report.additionalNotes.trim()
    };

    const savedReport = report.rawId
      ? await moduleApi.updateMedicalReport({
          baseUrl: apiBaseUrl,
          token,
          reportId: report.rawId,
          payload
        })
      : await moduleApi.createMedicalReport({
          baseUrl: apiBaseUrl,
          token,
          payload
        });

    const nextReport = mapReport(savedReport);

    setState((current) => {
      const exists = current.reports.some((item) => item.rawId === nextReport.rawId);
      const nextReports = exists
        ? current.reports.map((item) => (item.rawId === nextReport.rawId ? nextReport : item))
        : [nextReport, ...current.reports];

      return {
        ...current,
        reports: nextReports
      };
    });
  };

  const deleteReport = async (reportId) => {
    await moduleApi.deleteMedicalReport({
      baseUrl: apiBaseUrl,
      token,
      reportId
    });

    setState((current) => ({
      ...current,
      reports: current.reports.filter((report) => report.rawId !== reportId)
    }));
  };

  const upsertSchedule = async (schedule) => {
    const payload = {
      doctorName: schedule.doctorName.trim(),
      availableDays: schedule.availableDays,
      startTime: schedule.startTime.trim(),
      endTime: schedule.endTime.trim(),
      status: schedule.status.trim()
    };

    const savedSchedule = schedule.rawId
      ? await moduleApi.updateSchedule({
          baseUrl: apiBaseUrl,
          token,
          scheduleId: schedule.rawId,
          payload
        })
      : await moduleApi.createSchedule({
          baseUrl: apiBaseUrl,
          token,
          payload
        });

    const nextSchedule = mapSchedule(savedSchedule);

    setState((current) => {
      const exists = current.schedules.some((item) => item.rawId === nextSchedule.rawId);
      const nextSchedules = exists
        ? current.schedules.map((item) => (item.rawId === nextSchedule.rawId ? nextSchedule : item))
        : [nextSchedule, ...current.schedules];

      return {
        ...current,
        schedules: nextSchedules
      };
    });
  };

  const deleteSchedule = async (scheduleId) => {
    await moduleApi.deleteSchedule({
      baseUrl: apiBaseUrl,
      token,
      scheduleId
    });

    setState((current) => ({
      ...current,
      schedules: current.schedules.filter((schedule) => schedule.rawId !== scheduleId)
    }));
  };

  const resetDemoData = async () => {
    await refreshData();
  };

  const value = useMemo(
    () => ({
      ...state,
      currentUser,
      isReady,
      refreshData,
      upsertDoctor,
      deleteDoctor,
      upsertPatient,
      deletePatient,
      upsertAppointment,
      deleteAppointment,
      upsertReport,
      deleteReport,
      upsertSchedule,
      deleteSchedule,
      resetDemoData
    }),
    [currentUser, isReady, refreshData, state]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return context;
}
