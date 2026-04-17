import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  editable = true
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8aa0ad"
        multiline={multiline}
        editable={editable}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
    color: "#38525b",
    textTransform: "uppercase",
    letterSpacing: 0.7
  },
  input: {
    borderWidth: 1,
    borderColor: "#d3dee5",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#12303a",
    shadowColor: "#9fb2bf",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  multilineInput: {
    minHeight: 104,
    textAlignVertical: "top"
  },
  inputError: {
    borderColor: "#dc2626"
  },
  errorText: {
    marginTop: 6,
    color: "#dc2626",
    fontSize: 12,
    paddingHorizontal: 4
  }
});
