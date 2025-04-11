import apiClient from '../../services/api/apiClient';

interface User {
    uuid: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    arq_id: string;
    active: boolean;
}

interface UserUpdate {
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    arq_id?: string;
    active?: boolean;
    groups?: string[];
    roles?: string[];
    permissions?: string[];
}

export const getUsers = async (uuid: string) => {
  const response = await apiClient.get(`/users/${uuid}`);
  return response.data;
};

export const getMe = async () => {
    try {
        const response = await apiClient.post('/users/me')
        return response.data;
    } catch (error) {
        console.error('Failed to fetch my account:', error);
        throw error;
    }
}

export const updateUser = async (uuid: string, userData: UserUpdate) => {
    try {   
        const response = await apiClient.patch(`/users/${uuid}`, userData)
        return response.data;
    } catch (error) {
        console.error(`Failed to update user ${uuid}:`, error);
        throw error;
    }
}

export const createUser = async (userData: User) => {
    try {
        const response = await apiClient.post('/users', userData)
        return response.data;
    } catch (error) {
        console.error('Failed to create user:', error);
        throw error;
    }
}

export const deleteUser = async (uuid: string) => {
    try {
        const response = await apiClient.delete(`/users/${uuid}`)
        return response.data;
    } catch (error) {
        console.error('Failed to delete user:', error);
        throw error;
    }
}

