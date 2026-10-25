import { preflight } from '@/features/keystone/mcp-oauth/http'
import { authorizationServerGET } from '@/features/keystone/mcp-oauth/routes'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return authorizationServerGET(request)
}

export function OPTIONS() {
  return preflight()
}
