import { api } from 'boot/axios';

export const getDocuments = async () => {
    const response = await api.get('/document');
    return response.data;
};

export const getDocumentsBySubcriterionId = async (subcriterionId, projectContractorId) => {
  const response = await api.get(`/document/subcriterion/${subcriterionId}/project-contractor/${projectContractorId}`);
  return response.data;
};

export const getDocumentsByEmployeId = async (employeeId) => {
  const response = await api.get(`/document/employee/${employeeId}`);
  return response.data;
};
export const getDocumentsByEmployeIdAndSubcriterionID = async (employeeId, subcriterionId) => {
  const response = await api.get(`/document/employee/${employeeId}/subcriterion/${subcriterionId}`);
  return response.data;
};

export const getDocumentsByProjectId = async (projectId) => {
  const response = await api.get(`/document/by-project/${projectId}`);
  return response.data;
}

export const getDocumentsByContractorId = async (contractorId) => {
  const response = await api.get(`/document/by-contractor/${contractorId}`);
  return response.data;
}

export const createDocuments = async (documentData) => {
  const response = await api.post('/document/',documentData);
  return response.data;
};

export const updateDocuments = async (documentData) => {
  const response = await api.put('/document/',documentData);
  return response.data;
};


export const deleteDocuments = async (idDocument) => {
  const response = await api.delete(`/document/${idDocument}`);
  return response.data;
};

export const sendNotification = async (projectContractorId) => {
  const response = await api.post('/document/send-notification', projectContractorId);
  return response.data;
}
