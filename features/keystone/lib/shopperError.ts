import { GraphQLError } from "graphql";

// Shopper-facing validation (bad input or a state rule). A GraphQLError is not masked as
// "Unexpected error." by Yoga, so the shopper sees the real reason plus a stable code.
// Never use this for internal/provider/config failures, or for messages carrying ids or secrets.
export function shopperError(message: string, code: string) {
  return new GraphQLError(message, { extensions: { code } });
}
