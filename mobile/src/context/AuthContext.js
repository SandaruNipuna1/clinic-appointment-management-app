import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_STORAGE_KEY = "clinic_frontend_auth_v1";

const AuthContext = createContext(null);

const demoUsers = [
  {
    id: "USR-001",
    fullName: "Admin Nimal Perera",
    email: "admin@clinic.demo",
    password: "admin123",
    role: "admin"
  },
  {
    id: "USR-002",
    fullName: "Reception Kavindi Silva",
    email: "reception@clinic.demo",
    password: "reception123",
    role: "receptionist"
  },
  {
    id: "USR-003",
    fullName: "Patient Ayesha Fernando",
    email: "patient@clinic.demo",
    password: "patient123",
    role: "patient"
  }
];

const getNextUserId = (users) => {
  const highest = users.reduce((max, user) => {
    const numericValue = Number(String(user.id).replace("USR-", ""));
    return Number.isNaN(numericValue) ? max : Math.max(max, numericValue);
  }, 0);

  return `USR-${String(highest + 1).padStart(3, "0")}`;
};

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(demoUsers);
  const [currentUser, setCurrentUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const saved = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUsers(parsed.users || demoUsers);
          setCurrentUser(parsed.currentUser || null);
        }
      } finally {
        setIsReady(true);
      }
    };

    loadAuth();
  }, []);

  const persistAuth = async (nextUsers, nextCurrentUser) => {
    setUsers(nextUsers);
    setCurrentUser(nextCurrentUser);
    await AsyncStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        users: nextUsers,
        currentUser: nextCurrentUser
      })
    );
  };

  const login = async ({ email, password }) => {
    const user = users.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    await persistAuth(users, user);
  };

  const signup = async ({ fullName, email, password, role }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      throw new Error("An account already exists for this email");
    }

    const newUser = {
      id: getNextUserId(users),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role
    };

    const nextUsers = [newUser, ...users];
    await persistAuth(nextUsers, newUser);
  };

  const updateProfile = async (payload) => {
    if (!currentUser) {
      return;
    }

    const updatedUser = {
      ...currentUser,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase()
    };

    const nextUsers = users.map((user) => (user.id === currentUser.id ? updatedUser : user));
    await persistAuth(nextUsers, updatedUser);
  };

  const logout = async () => {
    await persistAuth(users, null);
  };

  const value = useMemo(
    () => ({
      users,
      currentUser,
      isReady,
      login,
      signup,
      updateProfile,
      logout
    }),
    [users, currentUser, isReady]
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
