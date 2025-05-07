import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllRoles } from '../../services/api/permissionApi';
import { colors, textColors, colorVariations } from '../../theme';

// Define the structure of our roles data
interface RoleData {
  [key: string]: string[];
}


const DefineRoleScreen: React.FC = () => {
  const [roles, setRoles] = useState<RoleData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const roleColorMap = {
    admin: colors.primary,
    logistics: colors.secondary,
    regular: colors.info,
  };

  const roleIconMap = {
    admin: 'shield-checkmark',
    logistics: 'cube',
    regular: 'person',
  };

  const permissionIconMap: { [key: string]: string } = {
    create_user: 'person-add',
    manage_user: 'people',
    create_group: 'folder-open',
    manage_group: 'albums',
    create_role: 'key',
    manage_role: 'lock-closed',
    read_products: 'eye',
    manage_products: 'cart',
    read_history: 'time',
  };

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllRoles();
      if (response.data) {
        // Parse the response into the format we need
        // The API returns roles as an object, not an array
        const rolesData = response.data.roles as unknown as RoleData;
        setRoles(rolesData);
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (e) {
      setError('Failed to fetch roles. Please try again later.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const toggleRoleExpansion = (roleName: string) => {
    if (expandedRole === roleName) {
      setExpandedRole(null);
    } else {
      setExpandedRole(roleName);
    }
  };

  const renderPermissionItem = (permission: string, index: number, roleColor: string) => {
    const icon = permissionIconMap[permission] || 'checkmark-circle';
    
    return (
      <View key={`${permission}-${index}`} style={styles.permissionItem}>
        <View style={[styles.permissionIconContainer, { backgroundColor: roleColor + '20' }]}>
          <Ionicons name={icon as any} size={16} color={roleColor} />
        </View>
        <Text style={styles.permissionText}>
          {permission.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </Text>
      </View>
    );
  };

  const renderRoleCard = (roleName: string, permissions: string[]) => {
    const isExpanded = expandedRole === roleName;
    const roleColor = (roleColorMap as any)[roleName] || colors.primary;
    const roleIcon = (roleIconMap as any)[roleName] || 'person';
    
    return (
      <TouchableOpacity
        key={roleName}
        style={[styles.roleCard, { borderColor: roleColor + '40' }]}
        onPress={() => toggleRoleExpansion(roleName)}
        activeOpacity={0.7}
      >
        <View style={styles.roleHeader}>
          <View style={[styles.roleIconContainer, { backgroundColor: roleColor + '20' }]}>
            <Ionicons name={roleIcon as any} size={24} color={roleColor} />
          </View>
          <View style={styles.roleTitleContainer}>
            <Text style={styles.roleTitle}>
              {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
            </Text>
            <Text style={styles.roleSubtitle}>{permissions.length} permissions</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={textColors.secondary}
          />
        </View>

        {isExpanded && (
          <View style={styles.permissionsContainer}>
            <View style={styles.divider} />
            {permissions.map((permission, index) => 
              renderPermissionItem(permission, index, roleColor)
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading roles...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={50} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRoles}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Role Definitions</Text>
        <Text style={styles.screenSubtitle}>
          View permissions assigned to each role
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(roles).map((roleName) => 
          renderRoleCard(roleName, roles[roleName])
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: textColors.secondary,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: textColors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colorVariations.backgroundDarker,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: textColors.primary,
  },
  screenSubtitle: {
    fontSize: 14,
    color: textColors.secondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleTitleContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: textColors.primary,
  },
  roleSubtitle: {
    fontSize: 14,
    color: textColors.secondary,
    marginTop: 2,
  },
  permissionsContainer: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colorVariations.backgroundDarker,
    marginBottom: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionText: {
    fontSize: 14,
    color: textColors.primary,
  },
});

export default DefineRoleScreen;
