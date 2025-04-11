import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Card } from 'react-native-paper';
import { useUser } from '../../contexts/UserContext';
import { getMe, updateUser } from '../../services/api/userApi';

//Define User interface
interface User {
    uuid: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    arq_id: string;
    active: boolean;
    roles?: string[];
    groups?: string[];
    permissions?: string[];
}


export const MyAccountScreen = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isEdited, setIsEdited] = useState(false);
    const [editedUser, setEditedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUser();
    }, []);
    
    const fetchUser = async () => {
        try {   
            setIsLoading(true);
            const user = await getMe();
            setEditedUser(user);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    //handle saving changes in informaion
    const handleSave = async () => {
        if (!editedUser) {
            return;
        }
        try {
            setIsLoading(true);
            const updatedUser = await updateUser(editedUser?.uuid, editedUser);
            setEditedUser(updatedUser);
            setIsEdited(false);
        } catch (error) {
            console.error('Failed to save changes:', error);
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

    //rending loading state
    if(isLoading && !editedUser) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }
    

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>My Account</Text>

        <TextInput
            label="Username"
            value={editedUser?.username}
            onChangeText={(text) => updateField('username', text)}
            style={styles.input}
            disabled={!isLoading}
        />

        <TextInput
            label="First Name"
            value={editedUser?.first_name}
            onChangeText={(text) => updateField('first_name', text)}
            style={styles.input}
            disabled={!isLoading}
        />

        <TextInput
            label='Last Name'
            value={editedUser?.last_name}
            onChangeText={(text) => updateField('last_name', text)}
            style={styles.input}    
            disabled={!isLoading}
        />

        <TextInput
            label='Email'
            value={editedUser?.email}
            onChangeText={(text) => updateField('email', text)}
            style={styles.input}
            disabled={!isLoading}
            inputMode='email'
        />

        <TextInput
            label='ARQ ID'
            value={editedUser?.arq_id}
            onChangeText={(text) => updateField('arq_id', text)}
            style={styles.input}
            disabled={!isLoading}
        />
        <TextInput
            label='Groups'
            value={editedUser?.groups?.join(', ')}
            style={styles.input}
            readOnly={true}
            disabled={!isLoading}
        />
        <TextInput
            label='Roles'
            value={editedUser?.roles?.join(', ')}
            style={styles.input}
            readOnly={true}
            disabled={!isLoading}
        />
        <TextInput
            label='Permissions'
            value={editedUser?.permissions?.join(', ')}
            style={styles.input}
            readOnly={true}
            disabled={!isLoading}
        />

        <TextInput
            label='Active'
            value={editedUser?.active ? 'Yes' : 'No'}
            style={styles.input}
            readOnly={true}
            disabled={!isLoading}
        />

        <TextInput
            label='UUID'
            value={editedUser?.uuid}
            style={styles.input}
            readOnly={true}
            disabled={!isLoading}
        />

        <Button 
            mode='contained' 
            onPress={handleSave}
            disabled={!isEdited || isLoading}
            loading={isLoading}
            style = {styles.button}
        >
            Save Changes
        </Button>
        
        
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
    },
    button: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    });

