import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { MoreHorizontal, Shield, Users, Mail, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { formatDistance } from "date-fns";

const UPDATE_USER = gql`
  mutation UpdateUser($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
    updateUser(where: $where, data: $data) {
      id
      email
      role
      status
    }
  }
`;

const CREATE_INVITE = gql`
  mutation CreateInvite($data: InviteCreateInput!) {
    createInvite(data: $data) {
      id
      email
      status
    }
  }
`;

const RESET_PASSWORD = gql`
  mutation UpdateUserPassword($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
    updateUser(where: $where, data: $data) {
      id
    }
  }
`;

export function UserList({ users, isLoading, error, onPageChange, total }) {
  const [updateUser] = useMutation(UPDATE_USER);
  const [createInvite] = useMutation(CREATE_INVITE);
  const [resetPassword] = useMutation(RESET_PASSWORD);

  if (error) {
    return <div>Error loading users: {error.message}</div>;
  }

  const getRoleVariant = (role) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "warning";
      case "staff":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case "super_admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "orders_manager":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "products_manager":
        return <Users className="h-4 w-4 text-green-500" />;
      case "customers_manager":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "settings_manager":
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    await updateUser({
      variables: {
        where: { id },
        data: { isActive: !currentStatus },
      },
    });
  };

  const handleUpdateRole = async (id, newRole) => {
    await updateUser({
      variables: {
        where: { id },
        data: { role: newRole },
      },
    });
  };

  const handleResendInvite = async (email) => {
    await createInvite({
      variables: { email },
    });
  };

  const handleResetPassword = async (id) => {
    await resetPassword({
      variables: {
        where: { id },
      },
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Invited By</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-zinc-500">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-zinc-500">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.team ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{user.team.name}</span>
                      {user.team.leader?.id === user.id && (
                        <Badge variant="outline" className="mt-1">Team Leader</Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-500">No Team</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {user.permissions && getPermissionIcon(user.permissions)}
                    <span className="text-sm">
                      {user.permissions || "No special permissions"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "success" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.lastLogin ? (
                    <div className="flex flex-col">
                      <span>
                        {formatDistance(new Date(user.lastLogin), new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                      {user.metadata?.lastLoginIp && (
                        <span className="text-xs text-zinc-500">
                          from {user.metadata.lastLoginIp}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-500">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.invitedBy ? (
                    <span className="text-sm">{user.invitedBy.name}</span>
                  ) : (
                    <span className="text-sm text-zinc-500">Self registered</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(user.id, user.isActive)}>
                        {user.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResendInvite(user.email)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Invite
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                        <Lock className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem>Change Team</DropdownMenuItem>
                      <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 