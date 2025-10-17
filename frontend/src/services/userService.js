import { api } from 'boot/axios';

export const forgotPassword = async (mail) => {
    const response = await api.post('/users/user-forgot-password', mail);
    return response.data;
};

export const restorePassword = async (newPasswordObject) => {
    const response = await api.put('/users/restore-password', newPasswordObject);
    return response.data;
};

export const changePassword = async (newPasswordObject) => {
    const response = await api.put('/users/change-password', newPasswordObject);
    return response.data;
};

export const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const createUser = async (user) => {
    const response = await api.post('/users', user);
    return response.data;
}

export const updateUser = async (user) => {
    const response = await api.put('/users', user);
    return response.data;
}

export const getUser = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
}