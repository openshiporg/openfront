import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { UserList } from "./components/UserList";
import { Button } from "@ui/button";
import { PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";

const USERS_DATA_QUERY = gql`
  query UsersData($where: UserWhereInput = {}, $take: Int, $skip: Int) {
    users(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      name
      email
      role
      permissions
      isActive
      lastLogin
      team {
        id
        name
      }
      invitedBy {
        id
        name
      }
      metadata {
        id
        lastLoginIp
        lastLoginUserAgent
        preferences
        failedLoginAttempts
      }
    }
    usersCount(where: $where)
    teams {
      id
      name
      description
      members {
        id
      }
      leader {
        id
        name
      }
    }
  }
`;

export default function UsersPage() {
  const [searchParams, setSearchParams] = React.useState({
    where: {},
    take: 20,
    skip: 0,
  });

  const { data, loading, error } = useQuery(USERS_DATA_QUERY, {
    variables: searchParams,
  });

  const handleRoleFilter = (role) => {
    setSearchParams(prev => ({
      ...prev,
      where: role === "all" ? {} : { role: { equals: role } },
      skip: 0,
    }));
  };

  const getTeamStats = () => {
    if (!data?.teams) return { total: 0, withLeader: 0, avgSize: 0 };

    const total = data.teams.length;
    const withLeader = data.teams.filter(team => team.leader).length;
    const totalMembers = data.teams.reduce((sum, team) => sum + team.members.length, 0);
    const avgSize = total > 0 ? Math.round(totalMembers / total) : 0;

    return { total, withLeader, avgSize };
  };

  const getUserStats = () => {
    if (!data?.users) return { total: 0, active: 0, inactive: 0, admins: 0 };

    const total = data.usersCount;
    const active = data.users.filter(user => user.isActive).length;
    const inactive = total - active;
    const admins = data.users.filter(user => user.role === "admin").length;

    return { total, active, inactive, admins };
  };

  const teamStats = getTeamStats();
  const userStats = getUserStats();

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-sm text-zinc-500">
            Manage users, roles, and teams
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Team
          </Button>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{userStats.total}</p>
            <p className="text-sm text-zinc-500">
              {userStats.active} active, {userStats.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{userStats.admins}</p>
            <p className="text-sm text-zinc-500">
              With full system access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{teamStats.total}</p>
            <p className="text-sm text-zinc-500">
              {teamStats.withLeader} with assigned leaders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{teamStats.avgSize}</p>
            <p className="text-sm text-zinc-500">
              Members per team
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teams Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {data?.teams.map(team => (
              <div
                key={team.id}
                className="flex flex-col gap-2 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{team.name}</h3>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
                <p className="text-sm text-zinc-500">
                  {team.description || "No description"}
                </p>
                <div className="mt-2">
                  <p className="text-sm text-zinc-500">
                    Leader: {team.leader?.name || "Unassigned"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Members: {team.members.length}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full" onValueChange={handleRoleFilter}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="manager">Managers</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <UserList 
            users={data?.users || []}
            isLoading={loading}
            error={error}
            onPageChange={(page) => {
              setSearchParams(prev => ({
                ...prev,
                skip: (page - 1) * prev.take
              }));
            }}
            total={data?.usersCount || 0}
          />
        </TabsContent>

        {["admin", "manager", "staff"].map((role) => (
          <TabsContent key={role} value={role} className="mt-4">
            <UserList 
              users={data?.users || []}
              isLoading={loading}
              error={error}
              onPageChange={(page) => {
                setSearchParams(prev => ({
                  ...prev,
                  skip: (page - 1) * prev.take
                }));
              }}
              total={data?.usersCount || 0}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 