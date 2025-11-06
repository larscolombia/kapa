import { api } from 'boot/axios';

export const getSupportsByCategoryService = async (category) => {
    try {
        const response = await api.get('/supports', {
            params: { category }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getSupportsService = async () => {
    try {
        const response = await api.get('/supports');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createSupportService = async (supportData) => {
    try {
        const response = await api.post('/supports', supportData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateSupportService = async (id, supportData) => {
    try {
        const response = await api.put(`/supports/${id}`, supportData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteSupportService = async (id) => {
    try {
        const response = await api.delete(`/supports/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};