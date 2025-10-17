import { api } from 'boot/axios';

export const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
}

export const createProject = async (project) => {
    const response = await api.post('/projects', project);
    return response.data;
}

export const updateProject = async (project) => {
    const response = await api.put('/projects', project);
    return response.data;
}

export const getProject = async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
}

export const getProjectContractors = async (projectId) => {
    const response = await api.get(`/projects/${projectId}/contractors`);
    return response.data;
}

export const getProjectsByContractor = async (contractorId) => {
    const response = await api.get(`/contractors/${contractorId}/projects`);
    return response.data;
}