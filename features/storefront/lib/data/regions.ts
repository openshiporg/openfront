"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { cache } from "react"

export const listRegions = cache(async function () {
  const LIST_REGIONS_QUERY = gql`
    query ListRegions {
      regions {
        id
        name
        currency {
          code
        }
        countries {
          id
          name
          iso2
        }
      }
    }
  `;

  return openfrontClient.request(LIST_REGIONS_QUERY);
});

export const getRegion = cache(async function (countryCode: string) {
  const GET_REGION_QUERY = gql`
    query GetRegion($code: String!) {
      regions(where: { countries: { some: { iso2: { equals: $code } } } }) {
        id
        name
        currency {
          code
        }
        countries {
          id
          name
          iso2
        }
      }
    }
  `;

  const data = await openfrontClient.request(GET_REGION_QUERY, {
    code: countryCode
  });
  return data.regions[0];
}); 