import { keystoneContext } from '@/features/keystone/context'
import { authorizeGET, authorizePOST } from '@/features/keystone/mcp-oauth/routes'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return authorizeGET(keystoneContext, request)
}

export async function POST(request: Request) {
  return authorizePOST(keystoneContext, request)
}
