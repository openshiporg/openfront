'use server'

import { revalidatePath } from 'next/cache'
import { keystoneClient } from '../../../dashboard/lib/keystoneClient'
import crypto from 'crypto'

// Interface for OAuth app data
export interface OAuthApp {
  id: string
  name: string
  clientId: string
  clientSecret: string
  redirectUris: string[]
  scopes: string[]
  status: 'active' | 'inactive'
  description?: string
  metadata?: Record<string, any>  // Store app-specific metadata
  createdAt: string
  updatedAt: string
}

/**
 * Get list of OAuth apps for current user
 */
export async function getOAuthApps(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }]
) {
  const query = `
    query GetOAuthApps($where: OAuthAppWhereInput, $take: Int!, $skip: Int!, $orderBy: [OAuthAppOrderByInput!]) {
      items: oAuthApps(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        id
        name
        clientId
        clientSecret
        redirectUris
        scopes
        status
        description
        metadata
        createdAt
        updatedAt
      }
      count: oAuthAppsCount(where: $where)
    }
  `

  const response = await keystoneClient(query, {
    where,
    take,
    skip,
    orderBy,
  })

  if (response.success) {
    return {
      success: true,
      data: {
        items: response.data.items || [],
        count: response.data.count || 0,
      },
    }
  } else {
    console.error('Error fetching OAuth apps:', response.error)
    return {
      success: false,
      error: response.error || 'Failed to fetch OAuth apps',
      data: { items: [], count: 0 },
    }
  }
}

/**
 * Create a new OAuth app for Openship integration
 */
export async function createOpenshipOAuthApp(data: {
  appType: 'openship-shop' | 'openship-channel'
  openshipUrl: string
}) {
  try {
    const { appType, openshipUrl } = data

    // Clean URL
    let cleanUrl = openshipUrl.trim()
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`
    }
    cleanUrl = cleanUrl.replace(/\/$/, '') // Remove trailing slash

    // Generate client credentials
    const clientId = crypto.randomUUID()
    const clientSecret = crypto.randomBytes(32).toString('hex')

    // Define app-specific configuration
    const appConfig = {
      'openship-shop': {
        name: 'Openship Shop',
        description: 'Connect to Openship to manage your orders and sync products from connected shops.',
        metadata: {
          type: 'shop',
          platform: 'openship',
          oauthEndpoint: '/dashboard/platform/shops'
        },
        scopes: [
          'read_orders',
          'write_orders',
          'read_products',
          'write_products',
          'read_customers',
          'write_customers',
          'read_webhooks',
          'write_webhooks',
          'read_inventory'
        ]
      },
      'openship-channel': {
        name: 'Openship Channel', 
        description: 'Allow Openship to use this store as a fulfillment channel for order processing.',
        metadata: {
          type: 'channel',
          platform: 'openship',
          oauthEndpoint: '/dashboard/platform/channels'
        },
        scopes: [
          'write_orders',
          'read_products',
          'write_products',
          'read_inventory',
          'write_inventory',
          'write_webhooks'
        ]
      }
    }

    const config = appConfig[appType]
    const redirectUri = `${cleanUrl}/api/oauth/callback`

    // Create OAuth app using GraphQL mutation
    const createResponse = await keystoneClient(`
      mutation CreateOAuthApp($data: OAuthAppCreateInput!) {
        createOAuthApp(data: $data) {
          id
          name
          clientId
          redirectUris
          scopes
          status
          description
          createdAt
        }
      }
    `, {
      data: {
        name: config.name,
        clientId,
        clientSecret,
        redirectUris: [redirectUri],
        scopes: config.scopes,
        status: 'active',
        description: config.description,
        metadata: config.metadata
      }
    })

    if (!createResponse.success) {
      throw new Error(createResponse.error || 'Failed to create OAuth app')
    }

    // Revalidate the apps page
    revalidatePath('/dashboard/platform/apps')

    return {
      success: true,
      data: {
        ...createResponse.data.createOAuthApp,
        openshipUrl: cleanUrl,
        redirectUri,
        clientSecret // Include for immediate use
      }
    }

  } catch (error) {
    console.error('Error creating Openship OAuth app:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create OAuth app',
      data: null
    }
  }
}

/**
 * Delete an OAuth app
 */
export async function deleteOAuthApp(id: string) {
  try {
    const deleteResponse = await keystoneClient(`
      mutation DeleteOAuthApp($where: OAuthAppWhereUniqueInput!) {
        deleteOAuthApp(where: $where) {
          id
          name
        }
      }
    `, {
      where: { id }
    })

    if (!deleteResponse.success) {
      throw new Error(deleteResponse.error || 'Failed to delete OAuth app')
    }

    // Revalidate the apps page
    revalidatePath('/dashboard/platform/apps')

    return {
      success: true,
      data: deleteResponse.data.deleteOAuthApp
    }

  } catch (error) {
    console.error('Error deleting OAuth app:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete OAuth app',
      data: null
    }
  }
}

/**
 * Update OAuth app status
 */
export async function updateOAuthAppStatus(id: string, status: 'active' | 'inactive') {
  try {
    const updateResponse = await keystoneClient(`
      mutation UpdateOAuthApp($where: OAuthAppWhereUniqueInput!, $data: OAuthAppUpdateInput!) {
        updateOAuthApp(where: $where, data: $data) {
          id
          name
          status
        }
      }
    `, {
      where: { id },
      data: { status }
    })

    if (!updateResponse.success) {
      throw new Error(updateResponse.error || 'Failed to update OAuth app')
    }

    // Revalidate the apps page
    revalidatePath('/dashboard/platform/apps')

    return {
      success: true,
      data: updateResponse.data.updateOAuthApp
    }

  } catch (error) {
    console.error('Error updating OAuth app status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update OAuth app',
      data: null
    }
  }
}