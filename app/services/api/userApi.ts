import apiClient from '../../services/api/apiClient';

export const getUsers = async (uuid: string) => {
  const response = await apiClient.get(`/users/${uuid}`);
  return response.data;
};


