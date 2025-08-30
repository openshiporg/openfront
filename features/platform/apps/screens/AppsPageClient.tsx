'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, ChevronDown, Plus, Loader2 } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createOpenshipOAuthApp, updateOAuthAppRedirectUris } from "../actions"
import { toast } from "sonner"
import { MarketplaceInstallDialog } from "../components/MarketplaceInstallDialog"

// Available apps that can be activated
const AVAILABLE_APPS = [
  {
    id: 'openship-shop',
    title: 'Openship Shop',
    description: 'Connect to Openship to manage your orders and sync products from connected shops.',
    type: 'shop' as const,
    svgUrl: 'https://openship.org/images/integrations/openship.svg'
  },
  {
    id: 'openship-channel', 
    title: 'Openship Channel',
    description: 'Allow Openship to use this store as a fulfillment channel for order processing.',
    type: 'channel' as const,
    svgUrl: 'https://openship.org/images/integrations/openship.svg'
  }
]


interface AvailableApp {
  id: string
  title: string
  description: string
  type: 'shop' | 'channel'
  svgUrl: string
}

interface ExistingApp {
  id: string
  name: string
  description?: string
  clientId: string
  clientSecret: string
  redirectUris: string[]
  scopes: string[]
  status: 'active' | 'inactive'
  metadata?: Record<string, any>
}

// Helper function to get SVG URL for an installed app based on its metadata
const getAppSvgUrl = (app: ExistingApp): string | null => {
  if (!app.metadata?.type || !app.metadata?.platform) return null
  
  // Match based on platform and type
  if (app.metadata.platform === 'openship') {
    const marketplaceApp = AVAILABLE_APPS.find(marketApp => 
      marketApp.id === `openship-${app.metadata?.type}`
    )
    return marketplaceApp?.svgUrl || null
  }
  
  return null
}

interface AppsPageClientProps {
  existingApps: ExistingApp[]
}

interface AvailableAppCardProps {
  app: AvailableApp
  isActivated: boolean
  onActivate: () => void
}

const AvailableAppCard = ({ app, isActivated, onActivate }: AvailableAppCardProps) => {
  return (
    <Card className="p-6 border-transparent ring-1 ring-foreground/10">
      <div className="relative">
        <div className="space-y-4">
          <img 
            src={app.svgUrl} 
            alt={`${app.title} logo`}
            className="size-12"
          />
          <div className="space-y-2">
            <h3 className="text-base font-medium">{app.title}</h3>
            <p className="text-muted-foreground line-clamp-2 text-sm">{app.description}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <Button 
            variant="outline"
            size="sm" 
            className="gap-1 pr-2"
            onClick={onActivate}
            disabled={isActivated}
          >
            {isActivated ? 'Installed' : 'Install'}
            {!isActivated && <ChevronRight className="ml-0 !size-3.5 opacity-50" />}
          </Button>
        </div>
      </div>
    </Card>
  )
}

interface ExistingAppCardProps {
  app: ExistingApp
  onInstall: (app?: ExistingApp) => void
  onRedirectUrisUpdate: (appId: string, redirectUris: string[]) => void
}

const ExistingAppCard = ({ app, onInstall, onRedirectUrisUpdate }: ExistingAppCardProps) => {
  const svgUrl = getAppSvgUrl(app)
  const [showAddUrlDialog, setShowAddUrlDialog] = useState(false)
  const [newRedirectUrl, setNewRedirectUrl] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  
  const handleAddRedirectUrl = async () => {
    if (!newRedirectUrl.trim()) return
    
    setIsUpdating(true)
    try {
      const updatedUris = [...(app.redirectUris || []), newRedirectUrl.trim()]
      const result = await updateOAuthAppRedirectUris(app.id, updatedUris)
      
      if (result.success) {
        onRedirectUrisUpdate(app.id, updatedUris)
        setNewRedirectUrl('')
        setShowAddUrlDialog(false)
        toast.success('Redirect URL added successfully')
      } else {
        toast.error(result.error || 'Failed to add redirect URL')
      }
    } catch (error) {
      toast.error('Failed to add redirect URL')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReinstallToUrl = (redirectUrl: string) => {
    // Create a modified app object with only the selected redirect URL for reinstall
    const modifiedApp = {
      ...app,
      redirectUris: [redirectUrl]
    }
    onInstall(modifiedApp)
  }
  
  return (
    <>
      <Card className="p-6 border-transparent ring-1 ring-foreground/10">
        <div className="relative">
          <div className="space-y-4">
            {svgUrl && (
              <img 
                src={svgUrl} 
                alt={`${app.name} logo`}
                className="size-12"
              />
            )}
            <div className="space-y-2">
              <h3 className="text-base font-medium">{app.name}</h3>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {app.description || 'OAuth application for Openship integration'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm" 
                  className="gap-1 pr-2"
                >
                  Reinstall
                  <ChevronDown className="ml-0 !size-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {app.redirectUris?.map((uri, index) => (
                  <DropdownMenuItem 
                    key={index} 
                    onClick={() => handleReinstallToUrl(uri)}
                  >
                    {uri}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => setShowAddUrlDialog(true)}>
                  <div className="flex items-center gap-2">
                    <Plus className="size-4" />
                    <span>Add new redirect URL</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Add New Redirect URL Dialog */}
      <Dialog open={showAddUrlDialog} onOpenChange={setShowAddUrlDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Redirect URL</DialogTitle>
            <DialogDescription>
              Add a new redirect URL for {app.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="redirect-url">Redirect URL</Label>
              <Input
                id="redirect-url"
                value={newRedirectUrl}
                onChange={(e) => setNewRedirectUrl(e.target.value)}
                placeholder="https://example.com/oauth/callback"
                disabled={isUpdating}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the full URL where OAuth callbacks should be sent
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddUrlDialog(false)
                  setNewRedirectUrl('')
                }}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRedirectUrl}
                disabled={isUpdating || !newRedirectUrl.trim()}
                className="flex-1"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add URL
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function AppsPageClient({ existingApps = [] }: AppsPageClientProps) {
  const router = useRouter()
  const [activatedApps, setActivatedApps] = useState<string[]>([])
  const [isMarketplaceDialogOpen, setIsMarketplaceDialogOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<AvailableApp | null>(null)
  const [apps, setApps] = useState<ExistingApp[]>(existingApps)
  

  const handleInstallMarketplaceApp = useCallback((appId: string) => {
    const app = AVAILABLE_APPS.find(a => a.id === appId)
    if (app) {
      setSelectedApp(app)
      setIsMarketplaceDialogOpen(true)
    }
  }, [])

  const handleRedirectUrisUpdate = useCallback((appId: string, redirectUris: string[]) => {
    setApps(prevApps => 
      prevApps.map(app => 
        app.id === appId 
          ? { ...app, redirectUris }
          : app
      )
    )
  }, [])


  const handleInstall = useCallback((appOrDefault?: ExistingApp) => {
    const app = appOrDefault
    if (!app) {
      console.error('No app provided to handleInstall');
      return;
    }
    console.log('🔴 INSTALL BUTTON CLICKED - handleInstall called with app:', app);
    
    // Check if app has redirect URI configured
    if (!app.redirectUris || app.redirectUris.length === 0) {
      console.log('🔴 ERROR: No redirect URIs found for app');
      toast.error('No redirect URI configured for this app')
      return
    }

    console.log('🔴 App redirect URIs:', app.redirectUris);

    // Build OAuth state (marketplace flow)
    const state = JSON.stringify({
      type: 'marketplace',
      client_id: app.clientId,
      client_secret: app.clientSecret,
      app_name: app.name,
      app_type: app.metadata?.type || 'shop', // Include app type for proper routing
      adapter_slug: 'openfront', // Identifies which adapter to use for platform creation
      nonce: crypto.randomUUID()
    })

    // Build URL parameters to show OAuth install dialog (same as when coming from Openship)
    const searchParams = new URLSearchParams()
    searchParams.set('install', 'true')
    searchParams.set('client_id', app.clientId)
    searchParams.set('scope', app.scopes.join(' '))
    searchParams.set('redirect_uri', app.redirectUris[0])
    searchParams.set('response_type', 'code')
    searchParams.set('state', state)

    console.log('🔴 Setting URL params to show OAuth dialog:', searchParams.toString())
    
    // Navigate with search params to trigger dialog without page refresh
    router.push(`/dashboard/platform/apps?${searchParams.toString()}`)
  }, [router])



  return (
    <div className="px-4 md:px-6 pb-6">
      {/* Marketplace Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Marketplace</h2>
        <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
          {AVAILABLE_APPS.map((app) => (
            <AvailableAppCard
              key={app.id}
              app={app}
              isActivated={activatedApps.includes(app.id)}
              onActivate={() => handleInstallMarketplaceApp(app.id)}
            />
          ))}
        </div>
      </div>

      {/* Installed Apps Section */}
      <div>
        <h2 className="text-lg font-medium mb-4">Installed</h2>
        {apps.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No installed apps found. Install an app from the marketplace above to get started.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <ExistingAppCard
                key={app.id}
                app={app}
                onInstall={(appOverride) => handleInstall(appOverride || app)}
                onRedirectUrisUpdate={handleRedirectUrisUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Marketplace Install Dialog */}
      <MarketplaceInstallDialog 
        isOpen={isMarketplaceDialogOpen}
        onOpenChange={setIsMarketplaceDialogOpen}
        app={selectedApp}
      />

    </div>
  )
}