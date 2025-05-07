import { Alert } from 'react-native';
import apiClient from '../../services/api/apiClient';
import { AxiosError } from 'axios';

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
    role?: string;
    groups?: string[];
    permissions?: string[];
    sub?: string;
    group_uuid?: string;
    group_permissions?: Record<string, any>;
}

interface UserUpdate {
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    arq_id?: string;
    active?: boolean;
    groups?: string[];
    roles?: string;
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
interface UserSearch {
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    arq_id?: string;
}

interface ApiError {
    status: number;
    message: string;
}

interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}


// Add a new interface for the updated API response
interface UserGroups {
    user_uuid: string;
    groups: {
        group_uuid: string;
        group_name: string;
    }[];
}

interface Permission {
    uuid: string;
    name: string;
}

// Helper function to extract error messages
const extractErrorMessage = (error: any): string => {
    if (error?.response?.data?.detail) {
        return String(error.response.data.detail);
    }
    
    return error?.message || 'An unexpected error occurred';
};

export const getUsersByUuid = async (uuid: string): Promise<ApiResponse<User>> => {
    try {
        const response = await apiClient.get(`/users/search/${uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to fetch user:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const getMe = async (): Promise<ApiResponse<User>> => {
    try {
        const response = await apiClient.get(`/users/me`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to fetch my account:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const searchUsers = async (userSearch: UserSearch): Promise<ApiResponse<User[]>> => {
    try {
        const response = await apiClient.get(`/users/search?first_name=${userSearch.first_name}&last_name=${userSearch.last_name}&username=${userSearch.username}&email=${userSearch.email}&arq_id=${userSearch.arq_id}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to search users:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const getActiveUsers = async (): Promise<ApiResponse<User[]>> => {
    try {
        const response = await apiClient.get('/users/view-all_active');
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to get active users:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
    try {
        const response = await apiClient.get('/users/view-all');
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to get all users:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};


export const updateUser = async (uuid: string, userData: UserUpdate): Promise<ApiResponse<{message: string; user: User}>> => {
    try {   
        const response = await apiClient.patch(`/users/update/${uuid}`, userData);
        return { data: response.data };
    } catch (error: any) {
        console.error(`Failed to update user ${uuid}:`, error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const createUser = async (userData: UserCreate): Promise<ApiResponse<{message: string; user: User; temp_password: string}>> => {
    try {
        const response = await apiClient.post('/users/new', userData);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to create user:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const getUserPermissions = async (user_uuid: string): Promise<ApiResponse<{permissions: string[]}>> => {
    try {
        const response = await apiClient.get(`/users/${user_uuid}/view-permissions`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to get user permissions:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};


export const getGroupUserIn = async (uuid: string): Promise<ApiResponse<UserGroups>> => {
    try {
        const response = await apiClient.get(`/users/group-user-in?user_uuid=${uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to get group user in:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const changeGroup = async (group_uuid: string): Promise<ApiResponse<{message: string; user: User; group_uuid: string}>> => {
    try {
        const response = await apiClient.post(`/users/change-group?group_uuid=${group_uuid}`);
        return { data: response.data };
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
          console.error('Failed to change group:', error);
          const backend_message = error.response.data.detail || 'An unknown error occurred';
          Alert.alert('Error', backend_message);
          throw backend_message;
        } else {
          console.error('Failed to change group:', error);
          throw new Error;
        }
      }
}

