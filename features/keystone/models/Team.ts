
import { list } from "@keystone-6/core";
import { text, relationship } from "@keystone-6/core/fields";
import { isSignedIn, permissions } from "../access";
import { trackingFields } from "./trackingFields";

const canManageTeams = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { id: { equals: session?.itemId } };
};

export const Team = list({
  access: {
    operation: {
      create: isSignedIn,
      query: isSignedIn,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers,
    },
    filter: {
      query: canManageTeams,
      update: canManageTeams,
    },
  },
  ui: {
    // hide the backend UI from regular users
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args),
  },
  fields: {
    name: text({
      validation: { isRequired: true },
    }),
    description: text(),
    members: relationship({
      ref: "User.team",
      many: true,
    }),
    leader: relationship({
      ref: "User.teamLead",
      many: false,
    }),
    ...trackingFields,
  },
  hooks: {
    validateInput: async ({ resolvedData, addValidationError, context }) => {
      const { name, leader, members } = resolvedData;

      if (name && name.length < 2) {
        addValidationError('Team name must be at least 2 characters long');
      }

      if (leader && members) {
        // Ensure leader is part of the team members
        const leaderInMembers = members.connect?.some(
          member => member.id === leader.connect?.id
        );

        if (!leaderInMembers) {
          addValidationError('Team leader must be a member of the team');
        }
      }
    },
    beforeOperation: async ({ operation, resolvedData, item, context }) => {
      if (operation === "delete") {
        // Check if any members are still in the team
        const teamWithMembers = await context.query.Team.findOne({
          where: { id: item.id },
          query: 'members { id }',
        });

        if (teamWithMembers?.members?.length > 0) {
          throw new Error("Cannot delete team with active members");
        }
      }
    },
  },
}); 