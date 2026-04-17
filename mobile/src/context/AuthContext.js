import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/authApi";

const AUTH_STORAGE_KEY = "clinic_frontend_auth_v1";

const AuthContext = createContext(null);

const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:5000/api";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    apiBaseUrl: DEFAULT_API_BASE_URL,
    token: "",
    currentUser: null
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const saved = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const nextBaseUrl = parsed.apiBaseUrl || DEFAULT_API_BASE_URL;
          const nextToken = parsed.token || "";

          if (nextToken) {
            try {
              const profile = await authApi.getProfile({
                baseUrl: nextBaseUrl,
                token: nextToken
              });

              const nextAuthState = {
                apiBaseUrl: nextBaseUrl,
                token: nextToken,
                currentUser: profile
              };

              setAuthState(nextAuthState);
              setCurrentUser(profile);
              await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuthState));
            } catch (error) {
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            }
          } else {
            setAuthState({
              apiBaseUrl: nextBaseUrl,
              token: "",
              currentUser: null
            });
            setCurrentUser(null);
          }
        }
      } finally {
        setIsReady(true);
      }
    };

    loadAuth();
  }, []);

  const persistAuth = async (nextAuthState) => {
    setAuthState(nextAuthState);
    setCurrentUser(nextAuthState.currentUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuthState));
  };

  const login = async ({ email, password, apiBaseUrl }) => {
    const nextBaseUrl = apiBaseUrl?.trim() || authState.apiBaseUrl || DEFAULT_API_BASE_URL;
    const data = await authApi.login({
      baseUrl: nextBaseUrl,
      payload: {
        email,
        password
      }
    });

    await persistAuth({
      apiBaseUrl: nextBaseUrl,
      token: data.token,
      currentUser: data.user
    });
  };

  const signup = async ({ fullName, email, password, role, apiBaseUrl }) => {
    const nextBaseUrl = apiBaseUrl?.trim() || authState.apiBaseUrl || DEFAULT_API_BASE_URL;
    const data = await authApi.signup({
      baseUrl: nextBaseUrl,
      payload: {
        fullName,
        email,
        password,
        role
      }
    });

    await persistAuth({
      apiBaseUrl: nextBaseUrl,
      token: data.token,
      currentUser: data.user
    });
  };

  const updateProfile = async (payload) => {
    if (!authState.token) {
      return;
    }

    const data = await authApi.updateProfile({
      baseUrl: authState.apiBaseUrl,
      token: authState.token,
      payload
    });

    await persistAuth({
      apiBaseUrl: authState.apiBaseUrl,
      token: data.token,
      currentUser: data.user
    });
  };

  const logout = async () => {
    const nextAuthState = {
      apiBaseUrl: authState.apiBaseUrl || DEFAULT_API_BASE_URL,
      token: "",
      currentUser: null
    };

    await persistAuth(nextAuthState);
  };

  const value = useMemo(
    () => ({
      apiBaseUrl: authState.apiBaseUrl,
      token: authState.token,
      currentUser,
      isReady,
      login,
      signup,
      updateProfile,
      logout
    }),
    [authState.apiBaseUrl, authState.token, currentUser, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
