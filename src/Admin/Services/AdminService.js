import { encodeId, decodeId } from '../pages/idEncoder';

const API_BASE = '/api/v1/Admins';
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};
export const createAdmin = async (formData) => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};
export const updateAdmin = async (encryptedId, formData) => {
  const id = decodeId(encryptedId);
  const response = await fetch(`${API_BASE}/${id}`, { 
    method: 'PUT',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteAdmin = async (encryptedId) => {
  const id = decodeId(encryptedId);
  
  const response = await fetch(`/api/v1/Admins/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Delete failed');
  }
  
  return await response.json();
};
export const getAdminById = async (encryptedId) => {
  const id = decodeId(encryptedId); // Convert to GUID
  const response = await fetch(`/api/v1/Admins/GetById?id=${id}`);
  if (!response.ok) throw new Error('Failed to get admin');
  return await response.json();
};

export const getAdminPhoto = async (encryptedId) => {
  const id = decodeId(encryptedId); // Convert to GUID
  const response = await fetch(`/api/v1/Admins/GetPhotoAdmin?id=${id}`);
  if (!response.ok) throw new Error('Failed to get photo');
  return await response.blob();
};

export const getAllAdmins = async () => {
  const response = await fetch(`/api/v1/Admins/GetAll`);
  if (!response.ok) throw new Error('Failed to fetch admins');
  const data = await response.json();
  
  return data.map(admin => ({
    ...admin,
    encryptedId: encodeId(admin.id) 
  }));
};