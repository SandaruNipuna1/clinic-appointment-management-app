import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { getDoctorById } from '../../services/doctorService';

export default function DoctorDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    getDoctorById(id)
      .then(({ data }) => setDoctor(data))
      .catch(() => Alert.alert('Error', 'Failed to load doctor'));
  }, [id]);

  if (!doctor) return <ActivityIndicator style={styles.center} size="large" color="#2563eb" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {doctor.image ? (
          <Image source={{ uri: `http://192.168.1.101:5000${doctor.image}` }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{doctor.name[0]}</Text>
          </View>
        )}
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.spec}>{doctor.specialization}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Email" value={doctor.email} />
        <Row label="Phone" value={doctor.phone} />
        <Row label="Experience" value={`${doctor.experience} years`} />
        {doctor.bio && <Row label="Bio" value={doctor.bio} />}
      </View>

      {doctor.availability?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Availability</Text>
          {doctor.availability.map((slot, i) => (
            <Text key={i} style={styles.slot}>
              {slot.day}: {slot.startTime} – {slot.endTime}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditDoctor', { doctor })}
      >
        <Text style={styles.editText}>Edit Doctor</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  center: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginTop: 12 },
  spec: { fontSize: 15, color: '#2563eb', marginTop: 4 },
  card: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { color: '#64748b', fontSize: 14 },
  value: { color: '#1e293b', fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
  slot: { color: '#475569', fontSize: 14, paddingVertical: 3 },
  editBtn: { backgroundColor: '#2563eb', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  editText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
