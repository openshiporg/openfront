import { keystoneContext } from '@/features/keystone/context'
import { preflight } from '@/features/keystone/mcp-oauth/http'
import { registerPOST } from '@/features/keystone/mcp-oauth/routes'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return registerPOST(keystoneContext, request)
}

export function OPTIONS() {
  return preflight()
}
