import React, { useState } from "react";
import { Alert, Text } from "react-native";

import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useSession } from "../context/SessionContext";
import { validateSession } from "../utils/validation";

export default function SessionSetupScreen({ navigation }) {
  const { saveSession } = useSession();
  const [values, setValues] = useState({
    apiBaseUrl: "http://10.0.2.2:5000/api",
    token: "",
    role: "admin",
    userId: ""
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
        Paste the API base URL and a valid JWT from your existing auth module so these screens can call the backend.
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
    </ScreenContainer>
  );
}
