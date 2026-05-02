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

const EMPTY_STATE = {
  patients: []
};

export function AppDataProvider({ children }) {
  const { apiBaseUrl, token, isReady: isAuthReady } = useAuth();
  const [state, setState] = useState(EMPTY_STATE);
  const [isReady, setIsReady] = useState(false);

  const refreshData = useCallback(async () => {
    if (!token) {
      setState(EMPTY_STATE);
      setIsReady(true);
      return;
    }

    try {
      const patients = await moduleApi.getPatients({ baseUrl: apiBaseUrl, token });
      setState({
        patients: patients.map(mapPatient)
      });
    } catch (error) {
      console.warn("Failed to load patients", error);
      setState(EMPTY_STATE);
    } finally {
      setIsReady(true);
    }
  }, [apiBaseUrl, token]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthReady) {
        return;
      }

      await refreshData();
    };

    load();
  }, [isAuthReady, refreshData]);

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

  const value = useMemo(
    () => ({
      ...state,
      isReady,
      refreshData,
      upsertPatient,
      deletePatient
    }),
    [deletePatient, isReady, refreshData, state]
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
