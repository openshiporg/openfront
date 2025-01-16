'use client';

import React from 'react';
import { gql, useQuery, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Switch } from "@ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";

const PERMISSIONS_QUERY = gql`
  query GetPermissions {
    roles {
      id
      name
      permissions
    }
    teams {
      id
      name
      role {
        id
        name
      }
      users {
        id
        name
        email
      }
    }
  }
`;

const UPDATE_TEAM_ROLE = gql`
  mutation UpdateTeamRole($id: ID!, $data: TeamUpdateInput!) {
    updateTeam(where: { id: $id }, data: $data) {
      id
      role {
        id
        name
      }
    }
  }
`;

const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $data: RoleUpdateInput!) {
    updateRole(where: { id: $id }, data: $data) {
      id
      name
      permissions
    }
  }
`;

const permissionsList = [
  'view_orders',
  'manage_orders',
  'view_products',
  'manage_products',
  'view_customers',
  'manage_customers',
  'view_settings',
  'manage_settings',
  'view_analytics',
  'manage_users',
  'manage_roles',
];

export function PermissionSettings({ loading: initialLoading }) {
  const { data, loading } = useQuery(PERMISSIONS_QUERY);
  const [updateTeamRole] = useMutation(UPDATE_TEAM_ROLE);
  const [updateRole] = useMutation(UPDATE_ROLE);

  const handleUpdateTeamRole = async (teamId, roleId) => {
    try {
      await updateTeamRole({
        variables: {
          id: teamId,
          data: {
            role: { connect: { id: roleId } },
          },
        },
      });
    } catch (error) {
      console.error('Failed to update team role:', error);
    }
  };

  const handleTogglePermission = async (roleId, permission, currentPermissions) => {
    try {
      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission];

      await updateRole({
        variables: {
          id: roleId,
          data: {
            permissions: newPermissions,
          },
        },
      });
    } catch (error) {
      console.error('Failed to update role permissions:', error);
    }
  };

  if (loading || initialLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Team Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.teams?.map((team) => (
              <div key={team.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{team.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {team.users?.length || 0} members
                      </Badge>
                      <Badge variant="outline">
                        {team.role?.name || 'No Role'}
                      </Badge>
                    </div>
                  </div>
                  <Select
                    value={team.role?.id}
                    onValueChange={(value) => handleUpdateTeamRole(team.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data?.roles?.map((role) => (
              <div key={role.id} className="space-y-4">
                <h3 className="font-medium">{role.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {permissionsList.map((permission) => (
                    <div key={permission} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{permission.replace('_', ' ').toUpperCase()}</p>
                      </div>
                      <Switch
                        checked={role.permissions?.includes(permission)}
                        onCheckedChange={() => handleTogglePermission(role.id, permission, role.permissions || [])}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 