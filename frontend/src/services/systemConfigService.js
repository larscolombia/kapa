import { api } from 'boot/axios';

// ============================================
// CONFIGURACIÓN Y METADATA
// ============================================

export const getMaestrosConfig = async () => {
  const response = await api.get('/system-config/maestros-config');
  return response.data;
};

export const getSystemStats = async () => {
  const response = await api.get('/system-config/stats');
  return response.data;
};

// ============================================
// CENTROS DE TRABAJO
// ============================================

export const getWorkCenters = async () => {
  const response = await api.get('/system-config/work-centers');
  return response.data;
};

export const getWorkCenter = async (id) => {
  const response = await api.get(`/system-config/work-centers/${id}`);
  return response.data;
};

export const createWorkCenter = async (data) => {
  const response = await api.post('/system-config/work-centers', data);
  return response.data;
};

export const updateWorkCenter = async (id, data) => {
  const response = await api.put(`/system-config/work-centers/${id}`, data);
  return response.data;
};

export const deleteWorkCenter = async (id) => {
  await api.delete(`/system-config/work-centers/${id}`);
};

// ============================================
// MAESTROS ILV
// ============================================

export const getIlvMaestros = async (filters = {}) => {
  const response = await api.get('/system-config/ilv-maestros', { params: filters });
  return response.data;
};

export const getIlvMaestrosSummary = async () => {
  const response = await api.get('/system-config/ilv-maestros/summary');
  return response.data;
};

export const getIlvMaestrosByTipo = async (tipo, includeInactive = false) => {
  const response = await api.get(`/system-config/ilv-maestros/tipo/${tipo}`, {
    params: { includeInactive }
  });
  return response.data;
};

export const getIlvMaestrosTree = async (tipo) => {
  const response = await api.get(`/system-config/ilv-maestros/tree/${tipo}`);
  return response.data;
};

export const getIlvMaestro = async (id) => {
  const response = await api.get(`/system-config/ilv-maestros/${id}`);
  return response.data;
};

export const createIlvMaestro = async (data) => {
  const response = await api.post('/system-config/ilv-maestros', data);
  return response.data;
};

export const updateIlvMaestro = async (id, data) => {
  const response = await api.put(`/system-config/ilv-maestros/${id}`, data);
  return response.data;
};

export const deleteIlvMaestro = async (id, hard = false) => {
  await api.delete(`/system-config/ilv-maestros/${id}`, { params: { hard } });
};

export const reactivateIlvMaestro = async (id) => {
  const response = await api.put(`/system-config/ilv-maestros/${id}/reactivate`);
  return response.data;
};

// ============================================
// MAESTROS INSPECCIONES
// ============================================

export const getInspeccionMaestros = async (filters = {}) => {
  const response = await api.get('/system-config/inspeccion-maestros', { params: filters });
  return response.data;
};

export const getInspeccionMaestrosSummary = async () => {
  const response = await api.get('/system-config/inspeccion-maestros/summary');
  return response.data;
};

export const getInspeccionMaestrosByTipo = async (tipo, includeInactive = false) => {
  const response = await api.get(`/system-config/inspeccion-maestros/tipo/${tipo}`, {
    params: { includeInactive }
  });
  return response.data;
};

export const getInspeccionMaestrosTree = async (tipo) => {
  const response = await api.get(`/system-config/inspeccion-maestros/tree/${tipo}`);
  return response.data;
};

export const getInspeccionMaestro = async (id) => {
  const response = await api.get(`/system-config/inspeccion-maestros/${id}`);
  return response.data;
};

export const createInspeccionMaestro = async (data) => {
  const response = await api.post('/system-config/inspeccion-maestros', data);
  return response.data;
};

export const updateInspeccionMaestro = async (id, data) => {
  const response = await api.put(`/system-config/inspeccion-maestros/${id}`, data);
  return response.data;
};

export const deleteInspeccionMaestro = async (id, hard = false) => {
  await api.delete(`/system-config/inspeccion-maestros/${id}`, { params: { hard } });
};

export const reactivateInspeccionMaestro = async (id) => {
  const response = await api.put(`/system-config/inspeccion-maestros/${id}/reactivate`);
  return response.data;
};

export default {
  // Config
  getMaestrosConfig,
  getSystemStats,
  // Work Centers
  getWorkCenters,
  getWorkCenter,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
  // ILV Maestros
  getIlvMaestros,
  getIlvMaestrosSummary,
  getIlvMaestrosByTipo,
  getIlvMaestrosTree,
  getIlvMaestro,
  createIlvMaestro,
  updateIlvMaestro,
  deleteIlvMaestro,
  reactivateIlvMaestro,
  // Inspeccion Maestros
  getInspeccionMaestros,
  getInspeccionMaestrosSummary,
  getInspeccionMaestrosByTipo,
  getInspeccionMaestrosTree,
  getInspeccionMaestro,
  createInspeccionMaestro,
  updateInspeccionMaestro,
  deleteInspeccionMaestro,
  reactivateInspeccionMaestro,
};
