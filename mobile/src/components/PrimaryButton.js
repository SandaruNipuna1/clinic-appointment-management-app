import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

export default function PrimaryButton({ title, onPress, loading, variant = "primary" }) {
  return (
    <Pressable
      style={[styles.button, variant === "secondary" && styles.secondaryButton]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#0f172a" : "#ffffff"} />
      ) : (
        <Text style={[styles.buttonText, variant === "secondary" && styles.secondaryText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10
  },
  secondaryButton: {
    backgroundColor: "#ccfbf1"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  secondaryText: {
    color: "#134e4a"
  }
});
