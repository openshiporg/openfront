'use server';

import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

/**
 * Get region by country
 */
export async function getRegionByCountry(countryCode: string) {
    const query = `
        query GetRegionByCountry($countryCode: String!) {
            regions(where: { countries: { some: { iso2: { equals: $countryCode } } } }) {
                id
                name
            }
        }
    `;

    const response = await keystoneClient(query, { countryCode });

    if (response.success) {
        return { success: true, data: response.data.regions[0] };
    }
    return response;
}

/**
 * Get active cart payment providers for a region
 */
export async function getActiveCartPaymentProviders(regionId: string) {
    const query = `
        query GetPaymentProviders($regionId: ID!) {
            activeCartPaymentProviders(regionId: $regionId) {
                id
                name
                code
                isInstalled
            }
        }
    `;

    const response = await keystoneClient(query, { regionId });

    if (response.success) {
        return { success: true, data: response.data.activeCartPaymentProviders };
    }
    return response;
} 