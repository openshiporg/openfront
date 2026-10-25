import { keystoneContext } from '@/features/keystone/context'
import { connectionsGET, connectionsPOST } from '@/features/keystone/mcp-oauth/routes'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return connectionsGET(keystoneContext, request)
}

export async function POST(request: Request) {
  return connectionsPOST(keystoneContext, request)
}
