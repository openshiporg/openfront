"use client";

import { useState } from "react";
import { gql, useQuery, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";

const TEAMS_QUERY = gql`
  query Teams {
    teams {
      id
      name
      description
      permissions
      users {
        id
        name
        email
      }
    }
  }
`;

const CREATE_TEAM = gql`
  mutation CreateTeam($data: TeamCreateInput!) {
    createTeam(data: $data) {
      id
      name
    }
  }
`;

const UPDATE_TEAM = gql`
  mutation UpdateTeam($id: ID!, $data: TeamUpdateInput!) {
    updateTeam(where: { id: $id }, data: $data) {
      id
      name
    }
  }
`;

const DELETE_TEAM = gql`
  mutation DeleteTeam($id: ID!) {
    deleteTeam(where: { id: $id }) {
      id
    }
  }
`;

export function TeamManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamData, setTeamData] = useState({ name: "", description: "", permissions: [] });

  const { data, loading, error, refetch } = useQuery(TEAMS_QUERY);
  const [createTeam] = useMutation(CREATE_TEAM);
  const [updateTeam] = useMutation(UPDATE_TEAM);
  const [deleteTeam] = useMutation(DELETE_TEAM);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await updateTeam({
          variables: {
            id: editingTeam.id,
            data: teamData,
          },
        });
      } else {
        await createTeam({
          variables: {
            data: teamData,
          },
        });
      }
      setTeamData({ name: "", description: "", permissions: [] });
      setEditingTeam(null);
      setIsCreateOpen(false);
      refetch();
    } catch (err) {
      console.error("Failed to save team:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      await deleteTeam({
        variables: { id },
      });
      refetch();
    } catch (err) {
      console.error("Failed to delete team:", err);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setTeamData({
      name: team.name,
      description: team.description || "",
      permissions: team.permissions || [],
    });
    setIsCreateOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading teams</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Teams</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Edit Team" : "Create Team"}</DialogTitle>
              <DialogDescription>
                {editingTeam
                  ? "Edit team details and permissions"
                  : "Create a new team and assign permissions"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={teamData.name}
                  onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                  placeholder="Team name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={teamData.description}
                  onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                  placeholder="Team description"
                />
              </div>
              <DialogFooter>
                <Button type="submit">{editingTeam ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{team.name}</div>
                    {team.description && (
                      <div className="text-sm text-muted-foreground">
                        {team.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {team.users?.map((user) => (
                      <div key={user.id} className="text-sm">
                        {user.name}
                        <span className="text-muted-foreground ml-1">
                          ({user.email})
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {team.permissions?.map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(team)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(team.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 