// This context manages user authentication state throughout the app.
// It handles login, signup, logout, and profile management, and persists auth data locally.

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/authApi";
import { normalizeApiBaseUrl } from "../api/apiClient";

// Key for storing authentication data in local storage
const AUTH_STORAGE_KEY = "clinic_frontend_auth_v1";

const AuthContext = createContext(null);

// Default API base URL from environment variables
const DEFAULT_API_BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL || "");

// AuthProvider component that wraps the app and provides authentication state
export function AuthProvider({ children }) {
  // Main authentication state
  const [authState, setAuthState] = useState({
    apiBaseUrl: DEFAULT_API_BASE_URL,
    token: "",
    currentUser: null
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Load saved authentication data when the app starts
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const saved = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const nextBaseUrl = normalizeApiBaseUrl(parsed.apiBaseUrl || DEFAULT_API_BASE_URL);
          const nextToken = parsed.token || "";

          if (nextToken) {
            try {
              // Verify the token is still valid by fetching user profile
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
              // Token is invalid, remove stored data
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

  // Save authentication state to local storage
  const persistAuth = async (nextAuthState) => {
    setAuthState(nextAuthState);
    setCurrentUser(nextAuthState.currentUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuthState));
  };

  // Login function
  const login = async ({ email, password, apiBaseUrl }) => {
    const nextBaseUrl = normalizeApiBaseUrl(apiBaseUrl || authState.apiBaseUrl || DEFAULT_API_BASE_URL);

    if (!nextBaseUrl) {
      throw new Error("API base URL is not configured");
    }

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

  // Signup function
  const signup = async ({ fullName, email, password, role, dateOfBirth, gender, phone, address, apiBaseUrl }) => {
    const nextBaseUrl = normalizeApiBaseUrl(apiBaseUrl || authState.apiBaseUrl || DEFAULT_API_BASE_URL);

    if (!nextBaseUrl) {
      throw new Error("API base URL is not configured");
    }

    const data = await authApi.signup({
      baseUrl: nextBaseUrl,
      payload: {
        fullName,
        email,
        password,
        role,
        dateOfBirth,
        gender,
        phone,
        address
      }
    });

    await persistAuth({
      apiBaseUrl: nextBaseUrl,
      token: data.token,
      currentUser: data.user
    });
  };

  // Update user profile function
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

  // Logout function
  const logout = async () => {
    const nextAuthState = {
      apiBaseUrl: authState.apiBaseUrl || DEFAULT_API_BASE_URL,
      token: "",
      currentUser: null
    };

    await persistAuth(nextAuthState);
  };

  // Context value with all auth functions and state
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

// Hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
