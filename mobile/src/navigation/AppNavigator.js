import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import AppointmentDetailScreen from "../screens/AppointmentDetailScreen";
import AppointmentFormScreen from "../screens/AppointmentFormScreen";
import AppointmentListScreen from "../screens/AppointmentListScreen";
import DoctorDetailsScreen from "../screens/DoctorDetailsScreen";
import DoctorListScreen from "../screens/DoctorListScreen";
import DoctorManagementFormScreen from "../screens/DoctorManagementFormScreen";
import HomeDashboardScreen from "../screens/HomeDashboardScreen";
import LoginScreen from "../screens/LoginScreen";
import MedicalReportDetailScreen from "../screens/MedicalReportDetailScreen";
import MedicalReportFormScreen from "../screens/MedicalReportFormScreen";
import MedicalReportListScreen from "../screens/MedicalReportListScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SignupScreen from "../screens/SignupScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isReady } = useAppData();
  const { currentUser, isReady: isAuthReady } = useAuth();

  if (!isReady || !isAuthReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={currentUser ? "Home" : "Login"}
        screenOptions={{
          headerLargeTitle: false,
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#f3f8fb"
          },
          headerTitleStyle: {
            color: "#17303b",
            fontWeight: "700"
          }
        }}
      >
        {currentUser ? (
          <>
            <Stack.Screen name="Home" component={HomeDashboardScreen} options={{ title: "Home" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
            <Stack.Screen name="DoctorList" component={DoctorListScreen} options={{ title: "Doctor Management" }} />
            <Stack.Screen name="DoctorForm" component={DoctorManagementFormScreen} options={{ title: "Doctor Form" }} />
            <Stack.Screen name="DoctorDetail" component={DoctorDetailsScreen} options={{ title: "Doctor Details" }} />
            <Stack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: "Appointments" }} />
            <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: "Appointment Form" }} />
            <Stack.Screen
              name="AppointmentDetail"
              component={AppointmentDetailScreen}
              options={{ title: "Appointment Details" }}
            />
            <Stack.Screen name="ReportList" component={MedicalReportListScreen} options={{ title: "Medical Reports" }} />
            <Stack.Screen
              name="ReportForm"
              component={MedicalReportFormScreen}
              options={{ title: "Medical Report Form" }}
            />
            <Stack.Screen
              name="ReportDetail"
              component={MedicalReportDetailScreen}
              options={{ title: "Report Details" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Sign Up" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
