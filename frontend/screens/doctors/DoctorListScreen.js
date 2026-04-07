import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { getAllDoctors, deleteDoctor } from '../../services/doctorService';

export default function DoctorListScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const { data } = await getAllDoctors();
      setDoctors(data);
    } catch {
      Alert.alert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchDoctors);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id) => {
    Alert.alert('Delete Doctor', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteDoctor(id);
          fetchDoctors();
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#2563eb" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DoctorDetail', { id: item._id })}
          >
            {item.image ? (
              <Image source={{ uri: `http://192.168.1.101:5000${item.image}` }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.spec}>{item.specialization}</Text>
              <Text style={styles.exp}>{item.experience} yrs experience</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No doctors found</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddDoctor')}>
        <Text style={styles.fabText}>+ Add Doctor</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  center: { flex: 1, justifyContent: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', margin: 10, borderRadius: 12,
    padding: 12, elevation: 2,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: { backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  spec: { fontSize: 13, color: '#2563eb', marginTop: 2 },
  exp: { fontSize: 12, color: '#64748b', marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteText: { color: '#ef4444', fontSize: 18, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94a3b8' },
  fab: {
    backgroundColor: '#2563eb', margin: 16, padding: 16,
    borderRadius: 12, alignItems: 'center',
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
