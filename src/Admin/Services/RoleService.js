import { encodeId, decodeId } from '../pages/idEncoder';

const API_BASE_ROLES = '/api/v1/AdminRoles';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

export const createAdminRole = async (formData) => {
  const response = await fetch(API_BASE_ROLES, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

export const getAllAdminRoles = async () => {
  const response = await fetch(`${API_BASE_ROLES}/GetAll`);
  if (!response.ok) throw new Error('Failed to fetch admin roles');
  const data = await response.json();
  return data.map(role => ({
    ...role,
    encryptedId: encodeId(role.id),
  }));
};

export const getAdminRoleById = async (encryptedId) => {
  const id = decodeId(encryptedId);
  const response = await fetch(`${API_BASE_ROLES}/GetById?id=${id}`);
  if (!response.ok) throw new Error('Failed to get admin role');
  const data = await response.json();
  return {
    ...data,
    encryptedId: encodeId(data.id),
  };
};

export const updateAdminRole = async (encryptedId, updateData) => {
  const id = decodeId(encryptedId);
  const response = await fetch(`${API_BASE_ROLES}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  return handleResponse(response);
};

export const deleteAdminRole = async (encryptedId) => {
  const id = decodeId(encryptedId);
  const response = await fetch(`${API_BASE_ROLES}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};