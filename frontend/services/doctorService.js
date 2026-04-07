import axios from 'axios';

const BASE_URL = 'http://192.168.1.101:5000/api';

const api = axios.create({ baseURL: BASE_URL });

export const getAllDoctors = () => api.get('/doctors');
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const createDoctor = (formData) =>
  api.post('/doctors', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDoctor = (id, formData) =>
  api.put(`/doctors/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);
