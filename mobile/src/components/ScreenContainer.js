import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

export default function ScreenContainer({ children, scroll = true }) {
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  scroll: {
    paddingBottom: 24
  },
  content: {
    padding: 16
  }
});
