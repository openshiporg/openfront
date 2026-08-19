import { permissions } from "../access";
import { retryPendingWebhookDeliveries } from "../../webhooks/webhook-plugin";

async function retryWebhookDeliveries(
  root: any,
  { limit = 25 }: { limit?: number },
  context: any
) {
  if (!permissions.canManageWebhooks({ session: context.session })) {
    throw new Error("Access denied");
  }
  return retryPendingWebhookDeliveries(context, limit);
}

export default retryWebhookDeliveries;
