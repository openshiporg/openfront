import { preflight } from '@/features/keystone/mcp-oauth/http'
import { protectedResourceGET } from '@/features/keystone/mcp-oauth/routes'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ resource?: string[] }> }) {
  const { resource } = await params
  return protectedResourceGET(request, resource)
}

export function OPTIONS() {
  return preflight()
}
