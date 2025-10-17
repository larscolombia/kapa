import { api } from 'boot/axios';

export const getRoles = async () => {
    const response = await api.get('/roles');
    return response.data;
};