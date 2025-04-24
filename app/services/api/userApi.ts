import apiClient from '../../services/api/apiClient';

interface User {
    uuid: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    email: string;
    arq_id: string;
    active: boolean;
    language_preference: string;
    roles?: string[];
    groups?: string[];
    permissions?: string[];
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

interface UserCreate {
    username?: string;
    first_name: string;
    last_name: string;
    email: string;
    arq_id: string;
    language_preference?: string;
}

export const getUsers = async (uuid: string) => {
  const response = await apiClient.get(`/users/${uuid}`);
  return response.data;
};

export const getMe = async () => {
    try {
        const response = await apiClient.get(`/users/me`)
        return response.data;
    } catch (error) {
        console.error('Failed to fetch my account:', error);
        throw error;
    }
}

export const searchUsers = async (first_name: string, last_name: string, username: string, email: string, arq_id: string) => {
    try {
        const response = await apiClient.get(`/users/search?first_name=${first_name}&last_name=${last_name}&username=${username}&email=${email}&arq_id=${arq_id}`)
        return response.data;
    } catch (error) {
        console.error('Failed to search users:', error);
        throw error;
    }
}

export const getActiveUsers = async () => {
    try {
        const response = await apiClient.get('/users/view-all_active')
        return response.data;
    } catch (error) {
        console.error('Failed to get active users:', error);
        throw error;
    }
}

export const getAllUsers = async () => {
    try {
        const response = await apiClient.get('/users/view-all')
        return response.data;
    } catch (error) {
        console.error('Failed to get all users:', error);
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

export const createUser = async (userData: UserCreate) => {
    try {
        const response = await apiClient.post('/users/new', userData)
        return response.data;
    } catch (error) {
        console.error('Failed to create user:', error);
        throw error;
    }
}

export const addPermissions = async (permissions_uuid: string, user_uuid: string) => {
    try {
        const response = await apiClient.post(`/users/add_permissions?permissions_uuid=${permissions_uuid}&user_uuid=${user_uuid}`)
        return response.data;
    } catch (error) {
        console.error('Failed to add permissions:', error);
        throw error;
    }
}

export const removePermissions = async (permissions_uuid: string, user_uuid: string) => {
    try {
        const response = await apiClient.post(`/users/remove_permissions?permissions_uuid=${permissions_uuid}&user_uuid=${user_uuid}`)
        return response.data;
    } catch (error) {
        console.error('Failed to remove permissions:', error);
        throw error;
    }
}

export const getGroupUserIn = async (uuid: string) => {
    try {
        const response = await apiClient.get(`/users/group-user-in?uuid=${uuid}`)
        return response.data;
    } catch (error) {
        console.error('Failed to get group user in:', error);
        throw error;
    }
}
