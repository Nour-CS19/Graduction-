// patientService.js
import axios from 'axios';

const API_BASE_URL = '/api/v1/Patients';

// Create a new patient
export const createPatient = async (patient) => {
  return await axios.post(API_BASE_URL, patient);
};

// Get all patients
export const getAllPatients = async () => {
  return await axios.get(`${API_BASE_URL}/GetAll`);
};

// Get a single patient by ID
export const getPatient = async (id) => {
  return await axios.get(`${API_BASE_URL}/${id}`);
};

// Update an existing patient
export const updatePatient = async (id, patient) => {
  return await axios.put(`${API_BASE_URL}/${id}`, patient);
};

// Delete a patient
export const deletePatient = async (id) => {
  return await axios.delete(`${API_BASE_URL}/${id}`);
};

// Upload a patient photo
export const uploadPatientPhoto = async (id, formData) => {
  return await axios.post(`${API_BASE_URL}/UploadPhoto/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// (Optional) Get a patient photo
export const getPatientPhoto = async (id) => {
  return await axios.get(`${API_BASE_URL}/${id}/photo`);
};
