import apiClient from "./apiClient";

export const getMyGroups = async () => {
    try {
        const response = await apiClient.get('/groups/view-my-groups')
        return response.data;
    } catch (error) {
        console.error('Failed to get my groups:', error);
        throw error;
    }
}

export const getAllGroups = async () => {
  try {
    const response = await apiClient.get('/groups/view-all');
    return response.data.groups;
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    throw error;
  }
};


export const createGroup = async (name: string) => {
    try {
        const response = await apiClient.post('/groups/create', { name })
        return response.data;
    } catch (error) {
        console.error('Failed to create group:', error);
        throw error;
    }
}

export const addUserToGroup = async (group_uuid: string, user_uuid: string) => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/add-user?group_uuid=${group_uuid}&user_uuid=${user_uuid}`)
        return response.data;
    } catch (error) {
        console.error('Failed to add user to group:', error);
        throw error;
    }
}

export const removeUserFromGroup = async (group_uuid: string, user_uuid: string) => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/remove-user?group_uuid=${group_uuid}&user_uuid=${user_uuid}`)
        return response.data;
    } catch (error) {
        console.error('Failed to remove user from group:', error);
        throw error;
    }
}

//below is backend needs more work
export const createRoleInGroup = async (group_uuid: string, name: string) => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/create-role-in-group?name=${name}`)
        return response.data;
    } catch (error) {
        console.error('Failed to create role in group:', error);
        throw error;
    }
}

export const addRoleToGroup = async (group_uuid: string, role_uuid: string) => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/add-role?role_uuid=${role_uuid}`)
        return response.data;
    } catch (error) {
        console.error('Failed to add role to group:', error);
        throw error;
    }
}

export const getRolesInGroup = async (group_uuid: string) => {
    try {
        const response = await apiClient.get(`/groups/${group_uuid}/roles`)
        return response.data;
    } catch (error) {
        console.error('Failed to get roles in group:', error);
        throw error;
    }
}

//essentially assigning group permission to a user but in a bundle
export const assignUserToRoleInGroup = async (group_uuid: string, role_uuid: string, user_uuid: string) => {
    try {
        const response = await apiClient.post(`/groups/${group_uuid}/roles/${role_uuid}/assign-user?uuid=${user_uuid}`)
        return response.data;
    } catch (error) {
        console.error('Failed to assign user to role in group:', error);
        throw error;
    }
}

export const searchGroup = async (name: string) => {
    try {
        const response = await apiClient.get(`/groups/name-to-uuid?name=${name}`)
        return response.data;
    } catch (error) {
        console.error('Failed to search group:', error);
        throw error;
    }
}