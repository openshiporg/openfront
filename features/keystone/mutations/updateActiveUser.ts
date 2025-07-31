async function updateActiveUser(root, { data, oldPassword }, context) {
  const sudoContext = context.sudo();

  // Check if user is authenticated
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }

  // Get current user
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId }
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // If trying to update password, verify old password first
  if (data.password && !oldPassword) {
    throw new Error("Old password is required to update password");
  }

  if (data.password) {
    const { authenticateUserWithPassword } = await sudoContext.graphql.raw({
      query: `
        mutation VerifyPassword($email: String!, $password: String!) {
          authenticateUserWithPassword(email: $email, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
              item {
                id
              }
            }
            ... on UserAuthenticationWithPasswordFailure {
              message
            }
          }
        }
      `,
      variables: {
        email: existingUser.email,
        password: oldPassword
      }
    });

    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      throw new Error("Invalid old password");
    }
  }

  // Update user
  return await sudoContext.db.User.updateOne({
    where: { id: session.itemId },
    data,
  });
}

export default updateActiveUser; 