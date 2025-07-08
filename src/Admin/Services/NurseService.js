import { encodeId, decodeId } from '../pages/idEncoder';

const API_BASE = '/api/v1/Nurses';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

export const nurseService = {
  createNurse: async (formData) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  updateNurse: async (encryptedId, formData) => {
    const id = decodeId(encryptedId);
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: formData,
    });
    return handleResponse(response);
  },

  deleteNurse: async (encryptedId) => {
    const id = decodeId(encryptedId);
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  },

  getNurseById: async (encryptedId) => {
    const id = decodeId(encryptedId);
    const response = await fetch(`${API_BASE}/GetById?id=${id}`);
    if (!response.ok) throw new Error('Failed to get nurse');
    return response.json();
  },

  getNursePhoto: async (encryptedId) => {
    const id = decodeId(encryptedId);
    const response = await fetch(`${API_BASE}/GetPhotoNurse?id=${id}`);
    if (!response.ok) throw new Error('Failed to get photo');
    return response.blob();
  },

  getAllNurses: async () => {
    const response = await fetch(`${API_BASE}/GetAll`);
    if (!response.ok) throw new Error('Failed to fetch nurses');
    const data = await response.json();
    return data.map(nurse => ({
      ...nurse,
      encryptedId: encodeId(nurse.id)
    }));
  }
};