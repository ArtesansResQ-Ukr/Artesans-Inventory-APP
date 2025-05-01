import apiClient from "./apiClient";

const extractErrorMessage = (error: any): string => {
    if (error?.response?.data?.detail) {
        return String(error.response.data.detail);
    }
    
    return error?.message || 'An unexpected error occurred';
};


export const createRole = async (name: string) => {
    try {
        const response = await apiClient.post(`/roles/create?name=${name}`);
        return response.data;
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

export const assignUserToRole = async (role_uuid: string, uuid: string) => {
    try {   
        const response = await apiClient.post(`/roles/${role_uuid}/assign-user?uuid=${uuid}`);
        return response.data;
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

export const removeUserFromRole = async (role_uuid: string, user_uuid: string) => {
    try {
        const response = await apiClient.delete(`/roles/${role_uuid}/remove-user`, { params: { user_uuid } });
        return response.data;
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
