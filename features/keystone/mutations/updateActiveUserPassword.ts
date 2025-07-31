async function updateActiveUserPassword(root, { oldPassword, newPassword, confirmPassword }, context) {
  const sudoContext = context.sudo();

  // Check if user is authenticated
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }

  // Get current user
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId },
    query: "id email"
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Verify old password
  const { data } = await sudoContext.graphql.raw({
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

  // Check if authentication failed
  if (data.authenticateUserWithPassword.message === 'Authentication failed.') {
    throw new Error("Invalid old password");
  }

  // Verify password confirmation
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  // Update password
  return await sudoContext.db.User.updateOne({
    where: { id: session.itemId },
    data: { password: newPassword },
  });
}

export default updateActiveUserPassword; 