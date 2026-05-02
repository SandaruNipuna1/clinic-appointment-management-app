import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InfoCard({ title, lines = [], children }) {
  return (
    <View style={styles.card}>
      <View style={styles.topAccent} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.linesWrap}>
        {lines.map((line, index) => (
          <Text key={`${title}-${index}`} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#dde8ee",
    shadowColor: "#6c8a97",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5
  },
  topAccent: {
    width: 44,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#74c8bd",
    marginBottom: 14
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#122b36"
  },
  linesWrap: {
    marginBottom: 4
  },
  line: {
    fontSize: 14,
    color: "#49616b",
    marginBottom: 7,
    lineHeight: 20
  }
});
