import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InfoCard({ title, lines = [], children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {lines.map((line, index) => (
        <Text key={`${title}-${index}`} style={styles.line}>
          {line}
        </Text>
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0f172a"
  },
  line: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 4
  }
});
