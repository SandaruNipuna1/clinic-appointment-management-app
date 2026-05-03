const crypto = require("crypto");

const users = [];
const patients = [];
let patientSequence = 0;

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeEmail = (email) => email.trim().toLowerCase();

const createUser = ({ fullName, email, passwordHash, role }) => {
  const user = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: normalizeEmail(email),
    passwordHash,
    role
  };

  users.push(user);
  return clone(user);
};

const findUserByEmail = (email) => clone(users.find((user) => user.email === normalizeEmail(email)) || null);

const findUserById = (id) => clone(users.find((user) => user.id === id) || null);

const saveUser = (updatedUser) => {
  const index = users.findIndex((user) => user.id === updatedUser.id);

  if (index >= 0) {
    users[index] = clone(updatedUser);
  }

  return clone(updatedUser);
};

const createPatient = (patient) => {
  patientSequence += 1;

  const nextPatient = {
    id: crypto.randomUUID(),
    patientCode: `PAT-${String(patientSequence).padStart(4, "0")}`,
    name: patient.name.trim(),
    dateOfBirth: new Date(`${patient.dateOfBirth}T00:00:00.000Z`),
    gender: patient.gender.trim(),
    phone: patient.phone.trim(),
    email: normalizeEmail(patient.email),
    address: patient.address.trim(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  patients.push(nextPatient);
  return clone(nextPatient);
};

const findPatients = () => clone(patients.filter((patient) => patient.isActive).sort((a, b) => a.name.localeCompare(b.name)));

const findPatientById = (id) => clone(patients.find((patient) => patient.id === id) || null);

const savePatient = (updatedPatient) => {
  const index = patients.findIndex((patient) => patient.id === updatedPatient.id);

  if (index >= 0) {
    updatedPatient.updatedAt = new Date();
    patients[index] = clone(updatedPatient);
  }

  return clone(updatedPatient);
};

const deactivatePatient = (patientId) => {
  const index = patients.findIndex((patient) => patient.id === patientId);

  if (index < 0) {
    return null;
  }

  patients[index].isActive = false;
  patients[index].updatedAt = new Date();

  return clone(patients[index]);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  saveUser,
  createPatient,
  findPatients,
  findPatientById,
  savePatient,
  deactivatePatient
};
