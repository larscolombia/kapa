import { api } from 'boot/axios';

export const getContractors = async () => {
    const response = await api.get('/contractors');
    return response.data;
};

export const createContractor = async (contractor) => {
    const response = await api.post('/contractors', contractor);
    return response.data;
}

export const updateContractor = async (contractor) => {
    const response = await api.put('/contractors', contractor);
    return response.data;
}

export const getContractor = async (contractorId) => {
    const response = await api.get(`/contractors/${contractorId}`);
    return response.data;
}

export const sendResults = async (projectContractorId) => {
    const response = await api.post('/contractors/send-results/', projectContractorId);
    return response.data;
}

export const getSubContractorsByContractor = async (contractorId) => {
    const response = await api.get(`/contractors/${contractorId}/subContractors`);
    return response.data;
}
