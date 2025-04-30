import apiClient from "./apiClient";

interface Group {
    uuid: string;
    name: string;
    permissions?: string[];
    roles?: string[];
    users?: string[];
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

export const getMyGroups = async (): Promise<ApiResponse<Group[]>> => {
    try {
        const response = await apiClient.get('/groups/view-my-groups');
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to get my groups:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const getAllGroups = async (): Promise<ApiResponse<Group[]>> => {
  try {
    const response = await apiClient.get('/groups/view');
    return { data: response.data.group };
  } catch (error: any) {
    console.error('Failed to fetch groups:', error);
    return { 
        error: {
            status: error?.response?.status || 500,
            message: extractErrorMessage(error)
        }
    };
  }
};

export const createGroup = async (name: string): Promise<ApiResponse<Group>> => {
    try {
        const response = await apiClient.post(`/groups/create?name=${name}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to create group:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const addUserToGroup = async (group_uuid: string, user_uuid: string): Promise<ApiResponse<{message: string; group: Group; user: any}>> => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/add-user?group_uuid=${group_uuid}&user_uuid=${user_uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to add user to group:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const removeUserFromGroup = async (group_uuid: string, user_uuid: string): Promise<ApiResponse<{message: string; group: Group; user: any}>> => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/remove-user?user_uuid=${user_uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to remove user from group:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const createRoleInGroup = async (group_uuid: string, name: string): Promise<ApiResponse<{message: string; role: any}>> => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/create-role-in-group?name=${name}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to create role in group:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const addRoleToGroup = async (group_uuid: string, role_uuid: string): Promise<ApiResponse<{message: string; role: any; group: Group}>> => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/add-role?role_uuid=${role_uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to add role to group:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const getRolesInGroup = async (group_uuid: string): Promise<ApiResponse<{roles: any[]}>> => {
    try {
        const response = await apiClient.get(`/groups/${group_uuid}/roles`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to get roles in group:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const assignUserToRoleInGroup = async (group_uuid: string, role_uuid: string, user_uuid: string): Promise<ApiResponse<{message: string; role: any; user: any}>> => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/roles/${role_uuid}/assign-user?uuid=${user_uuid}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to assign user to role in group:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const searchGroup = async (name: string): Promise<ApiResponse<{uuid: string}>> => {
    try {
        const response = await apiClient.get(`/groups/name-to-uuid?name=${name}`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to search group:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};

export const getGroupByUuid = async (group_uuid: string): Promise<ApiResponse<Group>> => {
    try {
        const response = await apiClient.get(`/groups/view?group_uuid=${group_uuid}`);
        return { data: response.data.group };
    } catch (error: any) {
        console.error('Failed to get group by uuid:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};
export const getAllUsersInGroup = async (group_uuid: string): Promise<ApiResponse<{users: any[]}>> => {
    try {
        const response = await apiClient.get(`/groups/${group_uuid}/get-all_users`);
        return { data: response.data };
    } catch (error: any) {
        console.error('Failed to get all users in group:', error);
        return { 
            error: {
                status: error?.response?.status || 500,
                message: extractErrorMessage(error)
            }
        };
    }
};
