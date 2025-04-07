import apiClient from "./apiClient";

// In a new groupApi.ts file or in an existing API file
export const getAllGroups = async () => {
    try {
      const response = await apiClient.get('/groups');
      return response.data.groups;
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      throw error;
    }
  };