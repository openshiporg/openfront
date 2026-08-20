const allowedActions = new Set(["access", "correct", "delete", "restrict", "object"]);

export async function updatePrivacyPreferences(
  root: any,
  { preferences }: { preferences: any },
  context: any
) {
  const userId = context.session?.itemId;
  if (!userId) throw new Error("Authentication required");
  const analytics = preferences?.analytics;
  const marketingEmail = preferences?.marketingEmail;
  if (typeof analytics !== "boolean" || typeof marketingEmail !== "boolean") {
    throw new Error("Privacy preferences must contain boolean analytics and marketingEmail values");
  }

  const receipt = {
    analytics,
    marketingEmail,
    recordedAt: new Date().toISOString(),
    source: "customer-account",
  };
  const sudo = context.sudo();
  const user = await sudo.query.User.findOne({
    where: { id: userId },
    query: "id userField { id preferences }",
  });
  if (!user) throw new Error("User not found");

  if (user.userField?.id) {
    await sudo.query.UserField.updateOne({
      where: { id: user.userField.id },
      data: {
        preferences: {
          ...(user.userField.preferences || {}),
          privacy: receipt,
        },
      },
    });
  } else {
    await sudo.query.UserField.createOne({
      data: {
        user: { connect: { id: userId } },
        preferences: { privacy: receipt },
      },
    });
  }
  return receipt;
}

export async function requestPrivacyAction(
  root: any,
  { action, details }: { action: string; details?: string },
  context: any
) {
  const userId = context.session?.itemId;
  if (!userId) throw new Error("Authentication required");
  if (!allowedActions.has(action)) throw new Error("Unsupported privacy action");

  const request = await context.sudo().query.Notification.createOne({
    data: {
      eventName: "PRIVACY_REQUEST",
      resourceType: "User",
      resourceId: userId,
      to: "privacy-operations",
      user: { connect: { id: userId } },
      data: {
        action,
        details: typeof details === "string" ? details.slice(0, 2000) : null,
        status: "pending_identity_verification",
        requestedAt: new Date().toISOString(),
      },
    },
    query: "id eventName createdAt data",
  });
  return request;
}

export async function getMyPrivacyData(root: any, args: any, context: any) {
  const userId = context.session?.itemId;
  if (!userId) throw new Error("Authentication required");
  const user = await context.sudo().query.User.findOne({
    where: { id: userId },
    query: `
      id name email phone createdAt updatedAt onboardingStatus
      addresses { id firstName lastName company address1 address2 city province postalCode phone country { iso2 } }
      userField { preferences }
      orders(orderBy: { createdAt: desc }, take: 250) { id displayId status createdAt email }
    `,
  });
  if (!user) throw new Error("User not found");
  return {
    generatedAt: new Date().toISOString(),
    user,
  };
}
