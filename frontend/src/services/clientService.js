import { api } from 'boot/axios';

export const getClients = async () => {
    const response = await api.get('/clients');
    return response.data;
};

export const getClient = async (clientId) => {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
}

export const getClientProjects = async (clientId) => {
    const response = await api.get(`/clients/${clientId}/projects`);
    return response.data;
}