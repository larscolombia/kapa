import { api } from 'boot/axios';

export const getProjectContractorByContractorIdAndProjectId = async (contractorId, projectId) => {
  const response = await api.get(`/project-contractors/contractor/${contractorId}/project/${projectId}`);
  return response.data;
};
