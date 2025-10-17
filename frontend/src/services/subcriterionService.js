import { api } from 'boot/axios';

export const getSubCriterion = async () => {
    const response = await api.get('/subcriterion');
    return response.data;
};

export const getSubCriterionsByCriterionId = async (idCriterion) => {
  const response = await api.get(`/subcriterion/by-criterion-id/${idCriterion}`);
  return response.data;
};

export const getSubCriterionsWithEmployeeRequired = async () => {
  const response = await api.get('/subcriterion/employee-required');
  return response.data;
};
