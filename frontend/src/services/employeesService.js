import { api } from 'boot/axios';

export const getEmployees = async () => {
    const response = await api.get('/employee/');
    return response.data;
};

export const getEmployeesByProjectContractorId = async (projectContractorId) => {
  const response = await api.get(`/employee/project-contractor/${projectContractorId}`);
  return response.data;
};

export const getEmployeeById = async (employeeId) => {
  const response = await api.get(`/employee/${employeeId}`);
  return response.data;
}

export const addEmployee = async (employeeData) => {
  const response = await api.post('/employee', employeeData);
  return response.data;
};

export const deleteEmployee = async (employeeId) => {
  const response = await api.delete(`/employee/${employeeId}`);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employee/${id}`, employeeData);
  return response.data;
};
