// apiNurse.js
/*
const API_BASE_URL = 'http://your-csharp-api-url/api'; 

export const fetchConsultations = async () => {
  const response = await fetch(`${API_BASE_URL}/consultations`);
  if (!response.ok) throw new Error('Failed to fetch consultations');
  return await response.json();
};

export const fetchAppointments = async () => {
  const response = await fetch(`${API_BASE_URL}/appointments`);
  if (!response.ok) throw new Error('Failed to fetch appointments');
  return await response.json();
};

export const updateConsultationStatus = async (id, status) => {
  const response = await fetch(`${API_BASE_URL}/consultations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update consultation');
  return await response.json();
};

export const addAppointment = async (appointment) => {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment)
  });
  if (!response.ok) throw new Error('Failed to add appointment');
  return await response.json();
};

*/



// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://physiocareapp.runasp.net/api/v1', // Adjust the URL if needed
  timeout: 10000, // 10 seconds timeout
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;

