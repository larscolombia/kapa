import { api } from 'boot/axios';

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

export const getPermissions = async () => {
    const response = await api.get('/auth/permissions');
    return response.data;
};