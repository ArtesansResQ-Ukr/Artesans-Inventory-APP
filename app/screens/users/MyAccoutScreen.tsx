import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Card, Switch, Chip } from 'react-native-paper';
import { getMe, updateUser } from '../../services/api/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import { AccountStackParamList } from '../../navigation/types/navigation';
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
    roles?: string[];
    groups?: string[];
    permissions?: string[];
    sub?: string;
    group_uuid?: string;
    group_permissions?: Record<string, any>;
}

export const MyAccountScreen = () => {
    const { logout } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isEdited, setIsEdited] = useState(false);
    const [editedUser, setEditedUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
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
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    //rendering error state
    if(error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="contained" onPress={fetchUser} style={styles.button}>
                    Try Again
                </Button>
                <Button mode="outlined" onPress={handleLogout} style={styles.button}>
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
                <Button mode="contained" onPress={fetchUser} style={styles.button}>
                    Refresh
                </Button>
                <Button mode="outlined" onPress={handleLogout} style={styles.button}>
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
            />

            <TextInput
                label="First Name"
                value={editedUser?.first_name || ''}
                onChangeText={(text) => updateField('first_name', text)}
                style={styles.input}
                disabled={isLoading}
            />

            <TextInput
                label='Last Name'
                value={editedUser?.last_name || ''}
                onChangeText={(text) => updateField('last_name', text)}
                style={styles.input}    
                disabled={isLoading}
            />

            <TextInput
                label='Email'
                value={editedUser?.email || ''}
                onChangeText={(text) => updateField('email', text)}
                style={styles.input}
                disabled={isLoading}
                keyboardType='email-address'
            />

            <TextInput
                label='ARQ ID'
                value={editedUser?.arq_id || ''}
                onChangeText={(text) => updateField('arq_id', text)}
                style={styles.input}
                disabled={isLoading}
            />
            

            <TextInput
                label='UUID'
                value={editedUser?.uuid || ''}
                style={styles.input}
                disabled={true}
            />

            <TextInput
                label='Group UUID'
                value={editedUser?.group_uuid || ''}
                style={styles.input}
                disabled={true}
            />

            <View style={styles.container}>
                <Text>Language Preference</Text>
                <Text>{editedUser?.language_preference === 'en' ? 'English' : editedUser?.language_preference === 'uk' ? 'Ukrainian' : 'Not set'}</Text>
            </View>

            <View style={styles.container}>
                <Text>Permissions</Text>
                <View style={styles.chipsContainer}>
                    {editedUser?.permissions?.map((permission, index) => (
                        <Chip key={index} style={styles.permissionChip}>
                            {permission}
                        </Chip>
                    ))}
                </View>
            </View>
            


            <Button 
                mode='contained' 
                onPress={handleSave}
                disabled={!isEdited || isLoading}
                loading={isLoading}
                style={styles.button}
            >
                Save Changes
            </Button>

            <Button 
                mode='contained' 
                onPress={() => navigation.navigate('SecuritySettings')}
                disabled={isLoading}
                style={[styles.button, { marginTop: 10, backgroundColor: '#4a90e2' }]}
                icon="shield-account"
            >
                Security Settings
            </Button>

            <Button 
                mode='contained' 
                onPress={handleLogout}
                disabled={isLoading}
                style={[styles.button, { marginTop: 10, backgroundColor: '#d9534f' }]}
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    form: {
        gap: 10,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 16,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    permissionChip: {
        margin: 4,
        backgroundColor: '#e0f2f1',
    },
});

