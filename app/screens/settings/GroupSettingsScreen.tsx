import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  ActivityIndicator, 
  Divider,
  Banner,
  List,
  Surface,
  useTheme,
  Avatar,
  RadioButton
} from 'react-native-paper';
import { getGroupUserIn, changeGroup, getMe } from '../../services/api/userApi';
import { useAuth } from '../../contexts/AuthContext';

interface Group {
  group_uuid: string;
  group_name: string;
}

interface UserGroups {
  user_uuid: string;
  groups: Group[];
  group_uuid?: string;
}

const GroupSettingsScreen = () => {
  const theme = useTheme();
  const { logout, user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userGroups, setUserGroups] = useState<UserGroups | null>(null);
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warningVisible, setWarningVisible] = useState(true);
  const [changingGroup, setChangingGroup] = useState(false);

  // Fetch user's groups
  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user data
      const userData = await getMe();
      if (!userData.data || !userData.data.uuid) {
        throw new Error('Failed to get current user data');
      }
      
      const userId = userData.data.uuid;
      
      // Get all groups the user belongs to
      const groupsResponse = await getGroupUserIn(userId);
      if (groupsResponse.error) {
        throw new Error(groupsResponse.error.message || 'Failed to fetch groups');
      }
      
      if (groupsResponse.data) {
        setUserGroups(groupsResponse.data);
        
        // Get the current group from auth context
        if (authUser && authUser.group_uuid) {
          setCurrentGroup(authUser.group_uuid);
        } else if (groupsResponse.data.groups && groupsResponse.data.groups.length > 0) {
          // Fallback to first group if no current group in context
          setCurrentGroup(groupsResponse.data.groups[0].group_uuid);
        }
      } else {
        throw new Error('No group data received');
      }
      
    } catch (err) {
      console.error('Error fetching user groups:', err);
      setError('Failed to load group information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, [authUser]);

  // Handle group change
  const handleGroupChange = async (groupUuid: string) => {
    if (currentGroup === groupUuid) {
      return; // No change needed
    }

    Alert.alert(
      "Change Group",
      "Are you sure you want to change your current group? You will be logged out and need to login again.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Change", 
          style: "destructive",
          onPress: async () => {
            try {
              setChangingGroup(true);
              const response = await changeGroup(groupUuid);
              
              if (response.data) {
                Alert.alert(
                  "Group Changed",
                  "Your group has been changed successfully. You will now be logged out.",
                  [
                    { 
                      text: "OK", 
                      onPress: () => {
                        // Log the user out
                        logout();
                      }
                    }
                  ]
                );
              }
            } catch (err) {
              console.error('Error changing group:', err);
              Alert.alert('Error', 'Failed to change group. Please try again.');
            } finally {
              setChangingGroup(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading group information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Avatar.Icon size={64} icon="alert" style={{ backgroundColor: theme.colors.error, marginBottom: 16 }} />
        <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => fetchUserGroups()} 
          style={{ marginTop: 16 }}
          icon="refresh"
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Banner
        visible={warningVisible}
        icon="alert"
        actions={[{ label: 'Dismiss', onPress: () => setWarningVisible(false) }]}
      >
        If you change your current group, you will be automatically logged out and will need to login again with your username and password or one-time passcode.
      </Banner>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.currentGroupHeader}>
              <Avatar.Icon size={40} icon="account-group" style={{ backgroundColor: theme.colors.primary }} />
              <Title style={styles.cardTitle}>Current Group</Title>
            </View>
            {currentGroup ? (
              <View style={styles.surfaceWrapper}>
                <Surface style={styles.currentGroupSurface}>
                  <Text style={styles.currentGroupName}>
                    {userGroups?.groups.find(g => g.group_uuid === currentGroup)?.group_name || 'Unknown Group'}
                  </Text>
                  <Avatar.Icon size={24} icon="check" style={styles.currentGroupIcon} />
                </Surface>
              </View>
            ) : (
              <Paragraph style={styles.noGroupText}>You are not currently assigned to any group</Paragraph>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.currentGroupHeader}>
              <Avatar.Icon size={40} icon="account-group-outline" style={{ backgroundColor: theme.colors.primary }} />
              <Title style={styles.cardTitle}>Your Groups</Title>
            </View>
            <Paragraph style={styles.groupSelectionText}>Select a group to change your current active group</Paragraph>
          </Card.Content>

          {userGroups?.groups && userGroups.groups.length > 0 ? (
            <View style={styles.groupsList}>
              {userGroups.groups.map((group) => (
                <TouchableOpacity 
                  key={group.group_uuid}
                  onPress={() => handleGroupChange(group.group_uuid)}
                  disabled={changingGroup}
                >
                  <List.Item
                    title={group.group_name}
                    description={currentGroup === group.group_uuid ? "Current Group" : null}
                    left={() => (
                      <View style={styles.radioContainer}>
                        <RadioButton
                          value={group.group_uuid}
                          status={currentGroup === group.group_uuid ? 'checked' : 'unchecked'}
                          onPress={() => handleGroupChange(group.group_uuid)}
                          disabled={changingGroup}
                          color={theme.colors.primary}
                        />
                      </View>
                    )}
                    right={() => (
                      currentGroup === group.group_uuid ? (
                        <List.Icon icon="check-circle" color={theme.colors.primary} />
                      ) : null
                    )}
                    style={[
                      styles.groupItem,
                      currentGroup === group.group_uuid ? styles.selectedGroup : null
                    ]}
                  />
                  <Divider />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Card.Content>
              <Paragraph style={styles.noGroupsText}>You are not a member of any groups</Paragraph>
            </Card.Content>
          )}
        </Card>
      </ScrollView>
      
      {changingGroup && (
        <View style={styles.loadingOverlay}>
          <View style={styles.surfaceWrapper}>
            <Surface style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Changing group...</Text>
            </Surface>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  currentGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 16,
    fontSize: 20,
  },
  surfaceWrapper: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  currentGroupSurface: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  currentGroupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentGroupIcon: {
    backgroundColor: '#1E88E5',
  },
  noGroupText: {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  groupsList: {
    marginTop: 8,
  },
  groupItem: {
    paddingVertical: 8,
  },
  selectedGroup: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  radioContainer: {
    marginRight: -8,
    justifyContent: 'center',
  },
  groupSelectionText: {
    marginBottom: 16,
  },
  noGroupsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 24,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
  },
});

export default GroupSettingsScreen; 