import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

export default function ScreenContainer({ children, scroll = true }) {
  const content = (
    <View style={styles.content}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f8fb"
  },
  scroll: {
    paddingBottom: 24
  },
  content: {
    padding: 18,
    position: "relative",
    overflow: "hidden"
  },
  glowTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#dbf3ee",
    top: -110,
    right: -70,
    opacity: 0.9
  },
  glowBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#edf6e8",
    bottom: -120,
    left: -90,
    opacity: 0.95
  }
});
