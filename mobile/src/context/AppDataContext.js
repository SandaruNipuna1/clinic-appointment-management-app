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
  roomNumber: doctor.roomNumber || "",
  department: doctor.department || ""
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

export function AppDataProvider({ children }) {
  const { apiBaseUrl, token, currentUser, isReady: isAuthReady } = useAuth();
  const [state, setState] = useState({
    doctors: [],
    appointments: [],
    reports: []
  });
  const [isReady, setIsReady] = useState(false);

  const refreshData = useCallback(async () => {
    if (!token) {
      setState({
        doctors: [],
        appointments: [],
        reports: []
      });
      setIsReady(true);
      return;
    }

    const [doctorData, appointmentData, reportData] = await Promise.all([
      moduleApi.getDoctors({ baseUrl: apiBaseUrl, token }),
      moduleApi.getAppointments({ baseUrl: apiBaseUrl, token }),
      moduleApi.getMedicalReports({ baseUrl: apiBaseUrl, token })
    ]);

    setState({
      doctors: doctorData.map(mapDoctor),
      appointments: appointmentData.map(mapAppointment),
      reports: reportData.map(mapReport)
    });
    setIsReady(true);
  }, [apiBaseUrl, token]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthReady) {
        return;
      }

      try {
        await refreshData();
      } catch (error) {
        console.warn("Failed to load app data", error);
        setState({
          doctors: [],
          appointments: [],
          reports: []
        });
        setIsReady(true);
      }
    };

    load();
  }, [isAuthReady, refreshData]);

  const upsertDoctor = async (doctor) => {
    const payload = {
      name: doctor.name.trim(),
      specialization: doctor.specialization.trim(),
      phone: doctor.phone.trim(),
      email: doctor.email.trim().toLowerCase(),
      availabilityLabel: doctor.availability.trim(),
      roomNumber: doctor.roomNumber.trim(),
      department: doctor.department.trim()
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
        doctors: nextDoctors,
        appointments: nextAppointments,
        reports: nextReports
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
      upsertAppointment,
      deleteAppointment,
      upsertReport,
      deleteReport,
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
