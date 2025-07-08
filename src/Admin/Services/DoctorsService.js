import { encodeId, decodeId } from '../pages/idEncoder';
import axios from 'axios';

const API_URL = '/api/v1/Doctors';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message;
  throw new Error(message);
};

export default {
  async getAllDoctors() {
    try {
      const response = await axios.get(API_URL);
      return response.data.map(doctor => ({
        ...doctor,
        encryptedId: encodeId(doctor.id)
      }));
    } catch (error) {
      handleError(error);
    }
  },

  async getAllDoctorsWithClinics() {
    try {
      const response = await axios.get(`${API_URL}/GetAllWithClinics`);
      return response.data.map(doctor => ({
        ...doctor,
        encryptedId: encodeId(doctor.id)
      }));
    } catch (error) {
      handleError(error);
    }
  },

  async createDoctor(doctorData) {
    try {
      const response = await axios.post(API_URL, doctorData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async updateDoctor(encryptedId, doctorData) {
    try {
      const id = decodeId(encryptedId);
      const response = await axios.put(`${API_URL}/${id}`, doctorData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async deleteDoctor(encryptedId) {
    try {
      const id = decodeId(encryptedId);
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async getDoctorById(encryptedId) {
    try {
      const id = decodeId(encryptedId);
      const response = await axios.get(`${API_URL}/GetById?id=${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};