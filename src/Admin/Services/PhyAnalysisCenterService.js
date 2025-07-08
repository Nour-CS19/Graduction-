// .js
import axios from 'axios';

const API_URL = '/api/v1/PhAnalysisCenters';

const PhyAnalysisCenterService = {
  getAll: () => axios.get(`${API_URL}/GetAll`),
  getById: (id) => axios.get(`${API_URL}/${id}`),
  create: (data) => axios.post(API_URL, data),
  update: (id, data) => axios.put(`${API_URL}/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/${id}`)
};

export default PhyAnalysisCenterService;
