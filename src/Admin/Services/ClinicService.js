import { encodeId, decodeId } from '../pages/idEncoder';
import axios from 'axios';

const API_URL = '/api/v1/Clinics';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message;
  throw new Error(message);
};

export default {
  async getAllClinics() {
    try {
      const response = await axios.get(API_URL);
      return response.data.map(clinic => ({
        ...clinic,
        encryptedId: encodeId(clinic.id)
      }));
    } catch (error) {
      handleError(error);
    }
  },

  async createClinic(clinicData) {
    try {
      const response = await axios.post(API_URL, clinicData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async updateClinic(encryptedId, clinicData) {
    try {
      const id = decodeId(encryptedId);
      const response = await axios.put(`${API_URL}/${id}`, clinicData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async deleteClinic(encryptedId) {
    try {
      const id = decodeId(encryptedId);
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  async getDoctorClinics() {
    try {
      const response = await axios.get('/api/v1/Doctors/GetAllWithClinics');
      return response.data.map(doctor => ({
        ...doctor,
        encryptedId: encodeId(doctor.id)
      }));
    } catch (error) {
      handleError(error);
    }
  }
};