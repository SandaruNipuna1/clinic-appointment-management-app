import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

export default function PrimaryButton({ title, onPress, loading, variant = "primary" }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        variant === "ghost" && styles.ghostButton,
        pressed && styles.pressedButton,
        loading && styles.disabledButton
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#ffffff" : "#113b44"} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "secondary" && styles.secondaryText,
            variant === "ghost" && styles.ghostText
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#0f766e",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  secondaryButton: {
    backgroundColor: "#dff5f1",
    borderWidth: 1,
    borderColor: "#b7e7dd",
    shadowOpacity: 0
  },
  ghostButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e3ea",
    shadowOpacity: 0
  },
  pressedButton: {
    opacity: 0.88
  },
  disabledButton: {
    opacity: 0.75
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2
  },
  secondaryText: {
    color: "#134e4a"
  },
  ghostText: {
    color: "#29444b"
  }
});
