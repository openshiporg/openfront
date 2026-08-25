'use server'

import { revalidatePath } from 'next/cache'
import { keystoneClient } from '../../../dashboard/lib/keystoneClient'

// Interface for OAuth app data
export interface OAuthApp {
  id: string
  name: string
  clientId: string
  clientSecret?: string
  redirectUris: string[]
  scopes: string[]
  status: 'active' | 'suspended'
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
export async function updateOAuthAppStatus(id: string, status: 'active' | 'suspended') {
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

/**
 * Update OAuth app redirect URIs
 */
export async function updateOAuthAppRedirectUris(id: string, redirectUris: string[]) {
  try {
    const updateResponse = await keystoneClient(`
      mutation UpdateOAuthApp($where: OAuthAppWhereUniqueInput!, $data: OAuthAppUpdateInput!) {
        updateOAuthApp(where: $where, data: $data) {
          id
          name
          redirectUris
        }
      }
    `, {
      where: { id },
      data: { redirectUris }
    })

    if (!updateResponse.success) {
      throw new Error(updateResponse.error || 'Failed to update OAuth app redirect URIs')
    }

    // Revalidate the apps page
    revalidatePath('/dashboard/platform/apps')

    return {
      success: true,
      data: updateResponse.data.updateOAuthApp
    }

  } catch (error) {
    console.error('Error updating OAuth app redirect URIs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update OAuth app redirect URIs',
      data: null
    }
  }
}