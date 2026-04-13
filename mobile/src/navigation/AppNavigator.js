import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useSession } from "../context/SessionContext";
import AdminMedicalRecordListScreen from "../screens/AdminMedicalRecordListScreen";
import CreateMedicalRecordScreen from "../screens/CreateMedicalRecordScreen";
import EditMedicalRecordScreen from "../screens/EditMedicalRecordScreen";
import PatientRecordsHistoryScreen from "../screens/PatientRecordsHistoryScreen";
import PrescriptionFormScreen from "../screens/PrescriptionFormScreen";
import ReportViewScreen from "../screens/ReportViewScreen";
import SessionSetupScreen from "../screens/SessionSetupScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isReady, session } = useSession();

  if (!isReady) {
    return null;
  }

  const startScreen = session.token ? (session.role === "admin" ? "AdminMedicalRecords" : "PatientHistory") : "SessionSetup";

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={startScreen}>
        <Stack.Screen name="SessionSetup" component={SessionSetupScreen} options={{ title: "Session Setup" }} />
        <Stack.Screen
          name="AdminMedicalRecords"
          component={AdminMedicalRecordListScreen}
          options={{ title: "Admin Medical Records" }}
        />
        <Stack.Screen
          name="CreateMedicalRecord"
          component={CreateMedicalRecordScreen}
          options={{ title: "Create Medical Record" }}
        />
        <Stack.Screen
          name="EditMedicalRecord"
          component={EditMedicalRecordScreen}
          options={{ title: "Edit Medical Record" }}
        />
        <Stack.Screen
          name="PrescriptionForm"
          component={PrescriptionFormScreen}
          options={{ title: "Prescription Form" }}
        />
        <Stack.Screen name="ReportView" component={ReportViewScreen} options={{ title: "Report View" }} />
        <Stack.Screen
          name="PatientHistory"
          component={PatientRecordsHistoryScreen}
          options={{ title: "Patient History" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
