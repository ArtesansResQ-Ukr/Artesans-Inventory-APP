import { Alert } from 'react-native';
import apiClient from '../../services/api/apiClient';
import { AxiosError } from 'axios';

interface Permission {
    uuid: string;
    name: string;
}

interface User {
    uuid: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    arq_id: string;
    active: boolean;
    language_preference: string;
    groups?: string[];
    permissions?: string[];
}
interface ApiError {
    status: number;
    message: string;
}
interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}
// Helper function to extract error messages
const extractErrorMessage = (error: any): string => {
    if (error?.response?.data?.detail) {
        return String(error.response.data.detail);
    }
    
    return error?.message || 'An unexpected error occurred';
};


export const addPermissions = async (permissions_uuid: string, user_uuid: string): Promise<ApiResponse<{message: string; user: User; permissions_uuid: string}>> => {
    try {
        const response = await apiClient.post(`/permissions/add?permissions_uuid=${permissions_uuid}&user_uuid=${user_uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to add permissions:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const removePermissions = async (permissions_uuid: string, user_uuid: string): Promise<ApiResponse<{message: string; user: User; permissions_removed: any}>> => {
    try {
        const response = await apiClient.post(`/permissions/remove?permissions_uuid=${permissions_uuid}&user_uuid=${user_uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to remove permissions:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};


export const getAllPermissions = async (): Promise<ApiResponse<{permissions: Permission[]}>> => {
    try {
        const response = await apiClient.get('/permissions/view-all');
        return { data: response.data.permissions };
    } catch (error: any) {
        console.error('Failed to get all permissions:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const assignRole = async (role_name: string, user_uuid: string): Promise<ApiResponse<{message: string; user: User; role: string; permissions: Permission[]}>> => {
    try {
        const response = await apiClient.post(`/permissions/assign-role?role_name=${role_name}&user_uuid=${user_uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to assign role:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
}

export const removeRole = async (role_name: string, user_uuid: string): Promise<ApiResponse<{message: string; user: User; role: string; permissions: Permission[]}>> => {
    try {
        const response = await apiClient.post(`/permissions/remove-role?role_name=${role_name}&user_uuid=${user_uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to remove role:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
}
