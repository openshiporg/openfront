"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { getAuthHeaders } from "./cookies"

export async function completeOnboarding() {
  const COMPLETE_ONBOARDING_MUTATION = gql`
    mutation CompleteOnboarding {
      completeOnboarding {
        success
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(COMPLETE_ONBOARDING_MUTATION, {}, headers);
} 