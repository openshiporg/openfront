"use server"
import { gql } from "graphql-request";
import { openfrontClient } from "../config";
import { getAuthHeaders } from "./cookies";
import { cookies } from "next/headers"; // Added import
import { redirect } from "next/navigation"; // Added import

export async function completeOnboarding() {
  const COMPLETE_ONBOARDING_MUTATION = gql`
    mutation CompleteOnboarding {
      completeOnboarding {
        success
      }
    }
  `;

  const headers = await getAuthHeaders(); // Added await
  return openfrontClient.request(COMPLETE_ONBOARDING_MUTATION, {}, headers);
} 


export async function resetOnboardingState(orderId: string) { // Added type string
  (await cookies()).set("_medusa_onboarding", "false", { maxAge: -1 }) // Added await
  redirect(`http://localhost:7001/a/orders/${orderId}`)
}