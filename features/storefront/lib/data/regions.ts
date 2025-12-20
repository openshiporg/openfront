"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { unstable_cache } from "next/cache"

export const listRegions = unstable_cache(
  async function () {
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
  },
  ["list-regions"],
  { tags: ["regions"], revalidate: 3600 }
);

export const getRegion = unstable_cache(
  async function (countryCode: string) {
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
  },
  ["get-region"],
  { tags: ["regions"], revalidate: 3600 }
);
