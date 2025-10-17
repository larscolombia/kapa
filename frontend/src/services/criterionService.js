import { api } from 'boot/axios';

export const getCriterion = async () => {
    const response = await api.get('/criterion');
    return response.data;
};

export const getCriterionById = async (id) => {
    const response = await api.get(`/criterion/${id}`);
    return response.data;
}

export const getCriterionsByProjectContractor = async (projectId, contractorId) => {
    const response = await api.get(`/project-contractors-criterions/project/${projectId}/contractor/${contractorId}/criterions`);
    return response.data;
};
