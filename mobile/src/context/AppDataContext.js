import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "clinic_frontend_demo_state_v1";

const initialDoctors = [
  {
    id: "DOC-001",
    name: "Dr. Nimal Perera",
    specialization: "Cardiology",
    phone: "+94 71 234 5678",
    email: "nimal.perera@clinic.demo",
    availability: "Mon, Wed, Fri - 09:00 to 15:00",
    roomNumber: "Cardiac Wing / Room 12",
    department: "Cardiology"
  },
  {
    id: "DOC-002",
    name: "Dr. Kavindi Silva",
    specialization: "Pediatrics",
    phone: "+94 77 456 7821",
    email: "kavindi.silva@clinic.demo",
    availability: "Tue, Thu - 10:00 to 17:00",
    roomNumber: "Children's Unit / Room 4",
    department: "Pediatrics"
  },
  {
    id: "DOC-003",
    name: "Dr. Rashmika Fernando",
    specialization: "Dermatology",
    phone: "+94 76 889 9012",
    email: "rashmika.fernando@clinic.demo",
    availability: "Daily - 11:00 to 18:00",
    roomNumber: "Skin Care / Room 8",
    department: "Dermatology"
  }
];

const initialAppointments = [
  {
    id: "APT-1001",
    patientName: "Ayesha Fernando",
    doctorId: "DOC-001",
    doctorName: "Dr. Nimal Perera",
    date: "2026-04-20",
    time: "09:30",
    reason: "Routine heart checkup",
    status: "Scheduled"
  },
  {
    id: "APT-1002",
    patientName: "Dilan Jayawardena",
    doctorId: "DOC-002",
    doctorName: "Dr. Kavindi Silva",
    date: "2026-04-21",
    time: "11:00",
    reason: "Child fever follow-up",
    status: "Completed"
  },
  {
    id: "APT-1003",
    patientName: "Nehara Wickramasinghe",
    doctorId: "DOC-003",
    doctorName: "Dr. Rashmika Fernando",
    date: "2026-04-22",
    time: "14:30",
    reason: "Skin allergy review",
    status: "Cancelled"
  }
];

const initialReports = [
  {
    id: "REP-5001",
    patientName: "Ayesha Fernando",
    doctorName: "Dr. Nimal Perera",
    diagnosis: "Stable blood pressure with mild arrhythmia",
    symptoms: "Occasional chest discomfort, fatigue",
    treatment: "Medication review and low-sodium diet",
    prescriptionNote: "Continue beta blocker for two weeks",
    reportDate: "2026-04-20",
    additionalNotes: "Follow-up ECG recommended in 14 days"
  },
  {
    id: "REP-5002",
    patientName: "Dilan Jayawardena",
    doctorName: "Dr. Kavindi Silva",
    diagnosis: "Seasonal viral infection",
    symptoms: "Fever, mild cough, low appetite",
    treatment: "Hydration, rest, temperature monitoring",
    prescriptionNote: "Paracetamol syrup as needed",
    reportDate: "2026-04-18",
    additionalNotes: "Observe for 48 hours before next review"
  }
];

const AppDataContext = createContext(null);

const initialState = {
  doctors: initialDoctors,
  appointments: initialAppointments,
  reports: initialReports
};

const getNextId = (prefix, items) => {
  const highest = items.reduce((max, item) => {
    const numericValue = Number(String(item.id).replace(`${prefix}-`, ""));
    return Number.isNaN(numericValue) ? max : Math.max(max, numericValue);
  }, 0);

  return `${prefix}-${String(highest + 1).padStart(4, "0")}`;
};

export function AppDataProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setState(JSON.parse(saved));
        }
      } finally {
        setIsReady(true);
      }
    };

    loadState();
  }, []);

  const persistState = async (nextState) => {
    setState(nextState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  };

  const upsertDoctor = async (doctor) => {
    const previousDoctor = state.doctors.find((item) => item.id === doctor.id);
    const normalizedDoctor = {
      ...doctor,
      id: doctor.id || getNextId("DOC", state.doctors)
    };

    const doctorExists = state.doctors.some((item) => item.id === normalizedDoctor.id);
    const nextDoctors = doctorExists
      ? state.doctors.map((item) => (item.id === normalizedDoctor.id ? normalizedDoctor : item))
      : [normalizedDoctor, ...state.doctors];

    const nextAppointments = state.appointments.map((appointment) =>
      appointment.doctorId === normalizedDoctor.id
        ? {
            ...appointment,
            doctorName: normalizedDoctor.name
          }
        : appointment
    );

    const nextReports = state.reports.map((report) =>
      report.doctorName === previousDoctor?.name
        ? {
            ...report,
            doctorName: normalizedDoctor.name
          }
        : report
    );

    await persistState({
      ...state,
      doctors: nextDoctors,
      appointments: nextAppointments,
      reports: nextReports
    });
  };

  const deleteDoctor = async (doctorId) => {
    await persistState({
      ...state,
      doctors: state.doctors.filter((doctor) => doctor.id !== doctorId)
    });
  };

  const upsertAppointment = async (appointment) => {
    const doctor = state.doctors.find((item) => item.id === appointment.doctorId);
    const normalizedAppointment = {
      ...appointment,
      id: appointment.id || getNextId("APT", state.appointments),
      doctorName: doctor?.name || appointment.doctorName || ""
    };

    const exists = state.appointments.some((item) => item.id === normalizedAppointment.id);
    const nextAppointments = exists
      ? state.appointments.map((item) => (item.id === normalizedAppointment.id ? normalizedAppointment : item))
      : [normalizedAppointment, ...state.appointments];

    await persistState({
      ...state,
      appointments: nextAppointments
    });
  };

  const deleteAppointment = async (appointmentId) => {
    await persistState({
      ...state,
      appointments: state.appointments.filter((appointment) => appointment.id !== appointmentId)
    });
  };

  const upsertReport = async (report) => {
    const normalizedReport = {
      ...report,
      id: report.id || getNextId("REP", state.reports)
    };

    const exists = state.reports.some((item) => item.id === normalizedReport.id);
    const nextReports = exists
      ? state.reports.map((item) => (item.id === normalizedReport.id ? normalizedReport : item))
      : [normalizedReport, ...state.reports];

    await persistState({
      ...state,
      reports: nextReports
    });
  };

  const deleteReport = async (reportId) => {
    await persistState({
      ...state,
      reports: state.reports.filter((report) => report.id !== reportId)
    });
  };

  const resetDemoData = async () => {
    await persistState(initialState);
  };

  const value = useMemo(
    () => ({
      ...state,
      isReady,
      upsertDoctor,
      deleteDoctor,
      upsertAppointment,
      deleteAppointment,
      upsertReport,
      deleteReport,
      resetDemoData
    }),
    [state, isReady]
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
