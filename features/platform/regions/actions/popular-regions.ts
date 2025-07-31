'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";
import { POPULAR_REGIONS } from "../constants/popular-regions";

/**
 * Create a popular region with all associated countries and currencies
 */
export async function createPopularRegion(templateName: string) {
  const template = POPULAR_REGIONS.find(r => r.name === templateName);
  
  if (!template) {
    return {
      success: false,
      error: `Popular region template "${templateName}" not found`,
      data: null,
    };
  }

  try {
    // Step 1: Create or get currencies
    const currencyIds: Record<string, string> = {};
    
    for (const currencyTemplate of template.currencies) {
      // Check if currency already exists
      const existingCurrencyQuery = `
        query GetCurrencyByCode($code: String!) {
          currencies(where: { code: { equals: $code } }) {
            id code
          }
        }
      `;
      
      const existingResponse = await keystoneClient(existingCurrencyQuery, {
        code: currencyTemplate.code
      });
      
      if (existingResponse.success && existingResponse.data.currencies.length > 0) {
        // Currency exists, use it
        currencyIds[currencyTemplate.code] = existingResponse.data.currencies[0].id;
      } else {
        // Create new currency
        const createCurrencyMutation = `
          mutation CreateCurrency($data: CurrencyCreateInput!) {
            createCurrency(data: $data) {
              id code
            }
          }
        `;
        
        const currencyResponse = await keystoneClient(createCurrencyMutation, {
          data: currencyTemplate
        });
        
        if (currencyResponse.success) {
          currencyIds[currencyTemplate.code] = currencyResponse.data.createCurrency.id;
        } else {
          throw new Error(`Failed to create currency ${currencyTemplate.code}: ${currencyResponse.error}`);
        }
      }
    }

    // Step 2: Create or get countries
    const countryIds: string[] = [];
    
    for (const countryTemplate of template.countries) {
      // Check if country already exists
      const existingCountryQuery = `
        query GetCountryByIso2($iso2: String!) {
          countries(where: { iso2: { equals: $iso2 } }) {
            id iso2
          }
        }
      `;
      
      const existingResponse = await keystoneClient(existingCountryQuery, {
        iso2: countryTemplate.iso2
      });
      
      if (existingResponse.success && existingResponse.data.countries.length > 0) {
        // Country exists, use it
        countryIds.push(existingResponse.data.countries[0].id);
      } else {
        // Create new country
        const createCountryMutation = `
          mutation CreateCountry($data: CountryCreateInput!) {
            createCountry(data: $data) {
              id iso2
            }
          }
        `;
        
        const countryResponse = await keystoneClient(createCountryMutation, {
          data: {
            ...countryTemplate,
            name: countryTemplate.displayName, // Map displayName to name
          }
        });
        
        if (countryResponse.success) {
          countryIds.push(countryResponse.data.createCountry.id);
        } else {
          throw new Error(`Failed to create country ${countryTemplate.iso2}: ${countryResponse.error}`);
        }
      }
    }

    // Step 3: Create the region
    const defaultCurrencyId = currencyIds[template.defaultCurrency];
    if (!defaultCurrencyId) {
      throw new Error(`Default currency ${template.defaultCurrency} not found`);
    }

    const createRegionMutation = `
      mutation CreateRegion($data: RegionCreateInput!) {
        createRegion(data: $data) {
          id name code taxRate automaticTaxes
          currency { id code symbol }
          countries { id iso2 displayName }
        }
      }
    `;

    const regionData = {
      name: template.name,
      code: template.code,
      taxRate: template.taxRate,
      automaticTaxes: template.automaticTaxes,
      currency: { connect: { id: defaultCurrencyId } },
      countries: { connect: countryIds.map(id => ({ id })) },
    };

    const regionResponse = await keystoneClient(createRegionMutation, {
      data: regionData
    });

    if (regionResponse.success) {
      revalidatePath('/dashboard/platform/regions');
      
      return {
        success: true,
        data: {
          region: regionResponse.data.createRegion,
          message: `Successfully created ${template.name} region with ${template.countries.length} countries and ${template.currencies.length} currencies`,
        },
      };
    } else {
      throw new Error(`Failed to create region: ${regionResponse.error}`);
    }

  } catch (error: any) {
    console.error('Error creating popular region:', error);
    return {
      success: false,
      error: error.message || `Failed to create ${template.name} region`,
      data: null,
    };
  }
}

/**
 * Get available popular region templates
 */
export async function getPopularRegionTemplates() {
  return {
    success: true,
    data: POPULAR_REGIONS.map(template => ({
      name: template.name,
      code: template.code,
      description: template.description,
      countriesCount: template.countries.length,
      currenciesCount: template.currencies.length,
      defaultCurrency: template.defaultCurrency,
      taxRate: template.taxRate,
    })),
  };
}