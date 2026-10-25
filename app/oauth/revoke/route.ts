import { keystoneContext } from '@/features/keystone/context'
import { preflight } from '@/features/keystone/mcp-oauth/http'
import { revokePOST } from '@/features/keystone/mcp-oauth/routes'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return revokePOST(keystoneContext, request)
}

export function OPTIONS() {
  return preflight()
}
