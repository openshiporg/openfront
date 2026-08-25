'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateOAuthAppRedirectUris } from '../actions'
import { toast } from 'sonner'

interface ExistingApp {
  id: string
  name: string
  description?: string
  clientId: string
  redirectUris: string[]
  scopes: string[]
  status: 'active' | 'suspended'
}

interface AppsPageClientProps {
  existingApps: ExistingApp[]
}

function ExistingAppCard({
  app,
  onRedirectUrisUpdate,
}: {
  app: ExistingApp
  onRedirectUrisUpdate: (appId: string, redirectUris: string[]) => void
}) {
  const [showAddUrlDialog, setShowAddUrlDialog] = useState(false)
  const [newRedirectUrl, setNewRedirectUrl] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAddRedirectUrl = async () => {
    const redirectUrl = newRedirectUrl.trim()
    if (!redirectUrl) return

    setIsUpdating(true)
    try {
      const updatedUris = [...(app.redirectUris || []), redirectUrl]
      const result = await updateOAuthAppRedirectUris(app.id, updatedUris)
      if (!result.success) {
        toast.error(result.error || 'Failed to add redirect URL')
        return
      }
      onRedirectUrisUpdate(app.id, updatedUris)
      setNewRedirectUrl('')
      setShowAddUrlDialog(false)
      toast.success('Redirect URL added successfully')
    } catch {
      toast.error('Failed to add redirect URL')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Card className="p-6 border-transparent ring-1 ring-foreground/10">
        <div className="space-y-2">
          <h3 className="text-base font-medium">{app.name}</h3>
          <p className="text-muted-foreground text-sm">
            {app.description || 'OAuth application'}
          </p>
          <p className="text-xs text-muted-foreground break-all">Client ID: {app.clientId}</p>
          <div className="space-y-1 pt-2">
            {(app.redirectUris || []).map((uri) => (
              <p key={uri} className="text-xs text-muted-foreground break-all">{uri}</p>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 gap-2"
          onClick={() => setShowAddUrlDialog(true)}
        >
          <Plus className="size-4" />
          Add redirect URL
        </Button>
      </Card>

      <Dialog open={showAddUrlDialog} onOpenChange={setShowAddUrlDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add redirect URL</DialogTitle>
            <DialogDescription>Add an OAuth callback URL for {app.name}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor={`redirect-url-${app.id}`}>Redirect URL</Label>
            <Input
              id={`redirect-url-${app.id}`}
              value={newRedirectUrl}
              onChange={(event) => setNewRedirectUrl(event.target.value)}
              placeholder="https://example.com/api/oauth/callback"
              disabled={isUpdating}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddUrlDialog(false)
                setNewRedirectUrl('')
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleAddRedirectUrl} disabled={isUpdating || !newRedirectUrl.trim()}>
              {isUpdating && <Loader2 className="mr-2 size-4 animate-spin" />}
              Add URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function AppsPageClient({ existingApps = [] }: AppsPageClientProps) {
  const [apps, setApps] = useState(existingApps)
  const handleRedirectUrisUpdate = useCallback((appId: string, redirectUris: string[]) => {
    setApps((current) => current.map((app) => app.id === appId ? { ...app, redirectUris } : app))
  }, [])

  return (
    <div className="px-4 pb-6 md:px-6">
      <h2 className="mb-4 text-lg font-medium">OAuth applications</h2>
      {apps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No OAuth applications configured.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <ExistingAppCard
              key={app.id}
              app={app}
              onRedirectUrisUpdate={handleRedirectUrisUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
