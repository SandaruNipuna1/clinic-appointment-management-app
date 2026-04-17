import React, { useState } from "react";
import { Alert, Text } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { DEMO_SESSION } from "../config/demoSession";
import { useSession } from "../context/SessionContext";
import { validateSession } from "../utils/validation";

export default function SessionSetupScreen({ navigation }) {
  const { saveSession, clearSession } = useSession();
  const [values, setValues] = useState({
    apiBaseUrl: DEMO_SESSION.apiBaseUrl,
    token: DEMO_SESSION.token,
    role: DEMO_SESSION.role,
    userId: DEMO_SESSION.userId
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const nextErrors = validateSession(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      await saveSession(values);
      navigation.reset({
        index: 0,
        routes: [{ name: values.role === "admin" ? "AdminMedicalRecords" : "PatientHistory" }]
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Temporary test setup</Text>
      <Text style={{ marginBottom: 16, color: "#475569" }}>
        The demo app auto-loads an admin session. Use this screen only if you want to override the demo URL or token.
      </Text>
      <FormInput
        label="API Base URL"
        value={values.apiBaseUrl}
        onChangeText={(value) => handleChange("apiBaseUrl", value)}
        error={errors.apiBaseUrl}
      />
      <FormInput
        label="JWT Token"
        value={values.token}
        onChangeText={(value) => handleChange("token", value)}
        error={errors.token}
        multiline
      />
      <FormInput
        label="Role"
        value={values.role}
        onChangeText={(value) => handleChange("role", value.toLowerCase())}
        error={errors.role}
        placeholder="admin or patient"
      />
      <FormInput
        label="User ID"
        value={values.userId}
        onChangeText={(value) => handleChange("userId", value)}
        error={errors.userId}
      />
      <PrimaryButton title="Save Session" onPress={handleSave} loading={loading} />
      <PrimaryButton
        title="Reset Demo Session"
        onPress={async () => {
          await clearSession();
          navigation.reset({
            index: 0,
            routes: [{ name: "AdminMedicalRecords" }]
          });
        }}
        variant="secondary"
      />
    </ScreenContainer>
  );
}
