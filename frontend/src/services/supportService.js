import { api } from 'boot/axios';

export const getSupportFiles = async (category = null) => {
  const params = category ? { category } : {};
  const response = await api.get('/supports', { params });
  return response.data;
};

export const getSupportCategories = async () => {
  const response = await api.get('/supports/categories');
  return response.data;
};

export const getSupportFileById = async (id) => {
  const response = await api.get(`/supports/${id}`);
  return response.data;
};

export const createSupportFile = async (supportFileData) => {
  const response = await api.post('/supports', supportFileData);
  return response.data;
};

export const updateSupportFile = async (id, supportFileData) => {
  const response = await api.put(`/supports/${id}`, supportFileData);
  return response.data;
};

export const deleteSupportFile = async (id) => {
  const response = await api.delete(`/supports/${id}`);
  return response.data;
};