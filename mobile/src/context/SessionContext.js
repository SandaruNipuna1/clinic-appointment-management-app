import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "clinic_module_session";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState({
    apiBaseUrl: "",
    token: "",
    role: "admin",
    userId: ""
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSession(JSON.parse(saved));
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
    const emptySession = {
      apiBaseUrl: "",
      token: "",
      role: "admin",
      userId: ""
    };
    setSession(emptySession);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      session,
      isReady,
      saveSession,
      clearSession
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
