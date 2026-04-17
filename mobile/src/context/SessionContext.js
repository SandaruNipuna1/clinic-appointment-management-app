import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEMO_SESSION } from "../config/demoSession";

const STORAGE_KEY = "clinic_module_session";
const EMPTY_SESSION = {
  apiBaseUrl: "",
  token: "",
  role: "admin",
  userId: ""
};

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(DEMO_SESSION);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSession(JSON.parse(saved));
        } else {
          setSession(DEMO_SESSION);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SESSION));
        }
      } finally {
        setIsReady(true);
      }
    };

    loadSession();
  }, []);

  const saveSession = async (nextSession) => {
    setSession(nextSession);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  };

  const clearSession = async () => {
    setSession(DEMO_SESSION);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SESSION));
  };

  const disableSession = async () => {
    setSession(EMPTY_SESSION);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      session,
      isReady,
      saveSession,
      clearSession,
      disableSession
    }),
    [session, isReady]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return context;
}
