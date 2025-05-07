import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Card, Switch, Chip } from 'react-native-paper';
import { getMe, updateUser, getGroupUserIn } from '../../services/api/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import { AccountStackParamList } from '../../navigation/types/navigation';
import { colors, textColors } from '../../theme';
//Define User interface
interface User {
    uuid: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    arq_id?: string;
    active?: boolean;
    password?: string;
    language_preference?: string;
    roles?: string;
    groups?: string[];
    permissions?: string[];
    sub?: string;
    group_uuid?: string;
    group_permissions?: Record<string, any>;
}

interface UserGroup {
    group_uuid: string;
    group_name: string;
}

interface UserGroups {
    user_uuid: string;
    groups: UserGroup[];
}

export const MyAccountScreen = () => {
    const { logout } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isEdited, setIsEdited] = useState(false);
    const [editedUser, setEditedUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [currentGroupName, setCurrentGroupName] = useState<string>('');
    const navigation = useNavigation<StackNavigationProp<AccountStackParamList>>();

    useEffect(() => {
        fetchUser();
    }, []);
    
    const fetchUser = async () => {
        try {   
            setIsLoading(true);
            setError(null);
            const userData = await getMe();
            console.log('User data received:', userData);
            if (userData.data) {
                setEditedUser(userData.data);
                
                // Fetch all groups the user is in
                if (userData.data && userData.data.uuid) {
                    const groupsData = await getGroupUserIn(userData.data.uuid);
                    if (groupsData.data && groupsData.data.groups) {
                        setUserGroups(groupsData.data.groups);
                        
                        // Set current group name if group_uuid matches
                        const currentGroup = groupsData.data.groups.find(
                            group => group.group_uuid === userData.data?.group_uuid
                        );
                        if (currentGroup) {
                            setCurrentGroupName(currentGroup.group_name);
                        }
                    }
                }
            } else {
                setError('No user data received from server');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setError('Failed to load user data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    //handle saving changes in information
    const handleSave = async () => {
        if (!editedUser) {
            return;
        }
        try {
            setIsLoading(true);
            // Save the changes
            await updateUser(editedUser?.uuid, editedUser);
            
            // After successful save, fetch fresh user data
            const freshUserData = await getMe();
            if (freshUserData.data) {
                setEditedUser(freshUserData.data);
            } else {
                setError('No user data received from server');
            }
            setIsEdited(false);
        } catch (error) {
            console.error('Failed to save changes:', error);
            setError('Failed to save changes. Please try again.');
        } finally {
            setIsLoading(false);
        }   
    };

    //update a field in the user
    const updateField = (field: keyof User, value: string) => {
        if (!editedUser) {
            return;
        }
        setEditedUser(prev => prev ? {...prev, [field]: value} : null);
        setIsEdited(true);
    };

    //rendering loading state
    if(isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text>Loading...</Text>
            </View>
        );
    }

    //rendering error state
    if(error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="contained" onPress={fetchUser} style={styles.button} buttonColor={colors.primary}>
                    Try Again
                </Button>
                <Button mode="outlined" onPress={handleLogout} style={styles.button} textColor={colors.primary}>
                    Logout
                </Button>
            </View>
        );
    }

    //rendering empty state
    if(!editedUser) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No user data available</Text>
                <Button mode="contained" onPress={fetchUser} style={styles.button} buttonColor={colors.primary}>
                    Refresh
                </Button>
                <Button mode="outlined" onPress={handleLogout} style={styles.button} textColor={colors.primary}>
                    Logout
                </Button>
            </View>
        );
    }
    

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>My Account</Text>

            <TextInput
                label="Username"
                value={editedUser?.sub || editedUser?.username || ''}
                onChangeText={(text) => updateField('username', text)}
                style={styles.input}
                disabled={isLoading}
                outlineColor={colors.primary}
                activeOutlineColor={colors.primary}
            />

            <TextInput
                label="First Name"
                value={editedUser?.first_name || ''}
                onChangeText={(text) => updateField('first_name', text)}
                style={styles.input}
                disabled={isLoading}
                outlineColor={colors.primary}
                activeOutlineColor={colors.primary}
            />

            <TextInput
                label='Last Name'
                value={editedUser?.last_name || ''}
                onChangeText={(text) => updateField('last_name', text)}
                style={styles.input}    
                disabled={isLoading}
                outlineColor={colors.primary}
                activeOutlineColor={colors.primary}
            />

            <TextInput
                label='Email'
                value={editedUser?.email || ''}
                onChangeText={(text) => updateField('email', text)}
                style={styles.input}
                disabled={isLoading}
                keyboardType='email-address'
                outlineColor={colors.primary}
                activeOutlineColor={colors.primary}
            />

            <TextInput
                label='ARQ ID'
                value={editedUser?.arq_id || ''}
                onChangeText={(text) => updateField('arq_id', text)}
                style={styles.input}
                disabled={isLoading}
                outlineColor={colors.primary}
                activeOutlineColor={colors.primary}
            />
            

            <TextInput
                label='UUID'
                value={editedUser?.uuid || ''}
                style={styles.input}
                disabled={true}
                outlineColor={colors.primary}
                activeOutlineColor={colors.primary}
            />

            <Card style={styles.sectionContainer}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Current Group</Text>
                    <View style={styles.groupInfoContainer}>
                        <Text style={styles.groupLabel}>UUID:</Text>
                        <Text style={styles.groupValue}>{editedUser?.group_uuid || 'Not assigned'}</Text>
                    </View>
                    <View style={styles.groupInfoContainer}>
                        <Text style={styles.groupLabel}>Name:</Text>
                        <Text style={styles.groupValue}>{currentGroupName || 'Not assigned'}</Text>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.sectionContainer}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>My Groups</Text>
                    {userGroups.length > 0 ? (
                        <View style={styles.chipsContainer}>
                            {userGroups.map((group, index) => (
                                <Chip 
                                    key={index} 
                                    style={[
                                        styles.groupChip, 
                                        group.group_uuid === editedUser?.group_uuid ? styles.currentGroupChip : {}
                                    ]}
                                >
                                    {group.group_name}
                                </Chip>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>You are not a member of any group</Text>
                    )}
                </Card.Content>
            </Card>

            <Card style={styles.sectionContainer}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Language Preference</Text>
                    <Text style={styles.preferenceText}>{editedUser?.language_preference === 'en' ? 'English' : editedUser?.language_preference === 'uk' ? 'Ukrainian' : 'Not set'}</Text>
                </Card.Content>
            </Card>

            <Card style={styles.sectionContainer}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Permissions</Text>
                    {editedUser?.permissions && editedUser.permissions.length > 0 ? (
                        <View style={styles.chipsContainer}>
                            {editedUser?.permissions?.map((permission, index) => (
                                <Chip key={index} style={styles.permissionChip}>
                                    {permission}
                                </Chip>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No permissions assigned</Text>
                    )}
                </Card.Content>
            </Card>
            
            <Button 
                mode='contained' 
                onPress={handleSave}
                disabled={!isEdited || isLoading}
                loading={isLoading}
                style={styles.button}
                buttonColor={colors.primary}
            >
                Save Changes
            </Button>

            <Button 
                mode='contained' 
                onPress={() => navigation.navigate('SecuritySettings')}
                disabled={isLoading}
                style={[styles.button, { marginTop: 10 }]}
                buttonColor={colors.primary}
                icon="shield-account"
            >
                Security Settings
            </Button>


            <Button 
                mode='contained' 
                onPress={handleLogout}
                disabled={isLoading}
                style={[styles.button, { marginTop: 10, backgroundColor: colors.error }]}
            >
                Logout
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: 50,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        textAlign: 'center',
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.primary,
    },
    form: {
        gap: 10,
    },
    input: {
        marginBottom: 12,
        backgroundColor: colors.white,
    },
    button: {
        marginTop: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    permissionChip: {
        margin: 4,
        backgroundColor: colors.primary + '20',
    },
    groupChip: {
        margin: 4,
        backgroundColor: colors.primary + '10',
    },
    currentGroupChip: {
        backgroundColor: colors.primary + '30',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    sectionContainer: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
        backgroundColor: colors.white,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colors.primary,
    },
    groupInfoContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    groupLabel: {
        fontWeight: 'bold',
        marginRight: 5,
        width: 60,
        color: textColors.primary,
    },
    groupValue: {
        flex: 1,
        color: textColors.secondary,
    },
    emptyText: {
        color: textColors.secondary,
        fontStyle: 'italic',
    },
    preferenceText: {
        color: textColors.primary,
    }
});

