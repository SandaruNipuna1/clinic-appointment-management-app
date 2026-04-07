import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Image, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateDoctor } from '../../services/doctorService';

export default function EditDoctorScreen({ route, navigation }) {
  const { doctor } = route.params;
  const [form, setForm] = useState({
    name: doctor.name,
    specialization: doctor.specialization,
    email: doctor.email,
    phone: doctor.phone,
    experience: String(doctor.experience),
    bio: doctor.bio || '',
  });
  const [image, setImage] = useState(null);
  const [availability, setAvailability] = useState(doctor.availability || []);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const addSlot = () =>
    setAvailability([...availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);

  const updateSlot = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const removeSlot = (index) =>
    setAvailability(availability.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('availability', JSON.stringify(availability));
      if (image) {
        formData.append('image', { uri: image.uri, name: 'doctor.jpg', type: 'image/jpeg' });
      }
      await updateDoctor(doctor._id, formData);
      Alert.alert('Success', 'Doctor updated successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  const currentImage = image ? image.uri : doctor.image ? `http://192.168.1.101:5000${doctor.image}` : null;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {currentImage ? (
          <Image source={{ uri: currentImage }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>📷 Change Photo</Text>
        )}
      </TouchableOpacity>

      {[
        { key: 'name', label: 'Full Name', placeholder: 'e.g. Dr. John Smith', keyboard: 'default' },
        { key: 'specialization', label: 'Specialization', placeholder: 'e.g. Cardiologist', keyboard: 'default' },
        { key: 'email', label: 'Email Address', placeholder: 'e.g. doctor@clinic.com', keyboard: 'email-address' },
        { key: 'phone', label: 'Phone Number', placeholder: 'e.g. 0123456789', keyboard: 'numeric' },
        { key: 'experience', label: 'Years of Experience', placeholder: 'e.g. 5', keyboard: 'numeric' },
        { key: 'bio', label: 'Bio / Description', placeholder: 'Brief description about the doctor...', keyboard: 'default' },
      ].map(({ key, label, placeholder, keyboard }) => (
        <View key={key}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[styles.input, key === 'bio' && styles.bioInput]}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            value={form[key]}
            onChangeText={(v) => setForm({ ...form, [key]: v })}
            keyboardType={keyboard}
            multiline={key === 'bio'}
            numberOfLines={key === 'bio' ? 3 : 1}
          />
        </View>
      ))}

      <Text style={styles.sectionTitle}>Availability</Text>
      {availability.map((slot, i) => (
        <View key={i} style={styles.slotCard}>
          <View style={styles.slotRow}>
            <View style={styles.slotField}>
              <Text style={styles.label}>Day</Text>
              <TextInput
                style={styles.input}
                value={slot.day}
                onChangeText={(v) => updateSlot(i, 'day', v)}
                placeholder="e.g. Monday"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.slotField}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={styles.input}
                value={slot.startTime}
                onChangeText={(v) => updateSlot(i, 'startTime', v)}
                placeholder="09:00"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.slotField}>
              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={styles.input}
                value={slot.endTime}
                onChangeText={(v) => updateSlot(i, 'endTime', v)}
                placeholder="17:00"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <TouchableOpacity onPress={() => removeSlot(i)} style={styles.removeBtn}>
              <Text style={styles.removeSlot}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addSlotBtn} onPress={addSlot}>
        <Text style={styles.addSlotText}>+ Add Slot</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Update Doctor</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 16 },
  imagePicker: {
    alignSelf: 'center', width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  imagePreview: { width: 100, height: 100, borderRadius: 50 },
  imagePickerText: { color: '#64748b', fontSize: 13, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4, marginTop: 2 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    marginBottom: 12, fontSize: 14, borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b',
  },
  bioInput: { height: 80, textAlignVertical: 'top' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginTop: 8, marginBottom: 10 },
  slotCard: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  slotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  slotField: { flex: 1 },
  removeBtn: { paddingBottom: 14 },
  removeSlot: { color: '#ef4444', fontSize: 18, fontWeight: 'bold' },
  addSlotBtn: { borderWidth: 1, borderColor: '#2563eb', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 10 },
  addSlotText: { color: '#2563eb', fontWeight: '600' },
  submitBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 32 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
