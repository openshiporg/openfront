import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-lg font-semibold">Page not found</h1>
        <Button asChild variant="outline"><Link href="/dashboard">Back to dashboard</Link></Button>
      </div>
    </div>
  )
}
