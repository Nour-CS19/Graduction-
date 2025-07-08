// src/api/nurseAppointment.js
import api from './api';

/**
 * Creates a new appointment.
 * @param {Object} appointmentData - Appointment details.
 * @param {string} appointmentData.typeService - Type of service.
 * @param {string} appointmentData.status - Status of the appointment.
 * @param {string} appointmentData.date - Appointment date (e.g., "2025-03-26").
 * @param {string} appointmentData.time - Appointment time.
 * @param {string} appointmentData.nurseID - Nurse ID.
 * @returns {Promise} - Axios response promise.
 */
export const createAppointment = (appointmentData) => {
  return api.post('/NurseAppointment/CreateAppointment', appointmentData);
};

/**
 * Retrieves an appointment by its ID.
 * @param {string} id - The appointment's ID.
 * @returns {Promise} - Axios response promise.
 */
export const getAppointmentById = (id) => {
  return api.get('/NurseAppointment/GetById', { params: { id } });
};

/**
 * Retrieves all appointments.
 * @returns {Promise} - Axios response promise.
 */
export const getAllAppointments = () => {
  return api.get('/NurseAppointment/GetAll');
};

/**
 * Deletes an appointment by its ID.
 * @param {string} id - The appointment's ID.
 * @returns {Promise} - Axios response promise.
 */
export const deleteAppointment = (id) => {
  return api.delete('/NurseAppointment/DeleteAppointment', { data: { id } });
};
