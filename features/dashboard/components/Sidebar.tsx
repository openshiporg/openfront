/**
 * Sidebar component - Navigation for Dashboard 2
 * Based on Dashboard 1 sidebar with consistent ShadCN styling and models dropdown
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Sidebar as SidebarComponent, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminMeta } from '../hooks/useAdminMeta'
import { Home, Database, ChevronRight, Package } from 'lucide-react'
import { Logo, LogoIcon } from '@/features/dashboard/components/Logo'
import { UserProfileClient } from './UserProfileClient'
import { OnboardingCards } from '@/features/platform/onboarding/components/OnboardingCards'
import OnboardingDialog from '@/features/platform/onboarding/components/OnboardingDialog'
import { dismissOnboarding } from '@/features/platform/onboarding/actions/onboarding'
import { platformNavGroups, platformStandaloneItems, getPlatformNavItemsWithBasePath } from '@/features/platform/lib/navigation'
import { useDashboard } from '../context/DashboardProvider'

interface User {
  id: string;
  email: string;
  name?: string;
  onboardingStatus?: string;
  role?: {
    canManageOnboarding?: boolean;
  };
}

interface SidebarProps {
  adminMeta: AdminMeta | null
  user?: User | null
}

export function Sidebar({ adminMeta, user }: SidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const [isOnboardingDialogOpen, setIsOnboardingDialogOpen] = React.useState(false)
  const { basePath } = useDashboard()

  const lists = adminMeta?.lists || {}
  const listsArray = Object.values(lists)

  // Function to check if a link is active
  const isLinkActive = React.useCallback(
    (href: string) => {
      if (!pathname) return false

      // Exact match for dashboard root
      if (href === '/dashboard' && pathname === '/dashboard') {
        return true
      }

      // For other pages, check if the pathname starts with the href
      if (href !== '/dashboard') {
        return pathname.startsWith(href)
      }

      return false
    },
    [pathname]
  )

  // Convert lists to sidebar links format
  const modelLinks = listsArray.map((list: any) => ({
    title: list.label,
    href: `/dashboard/${list.path}`
  }))

  // Platform navigation groups with proper basePath
  const platformItemsWithBasePath = getPlatformNavItemsWithBasePath(basePath)
  const platformItems = platformNavGroups.map((group) => ({
    title: group.title,
    items: platformItemsWithBasePath.filter(item => item.group === group.id).map(item => ({
      title: item.title,
      href: item.href,
      icon: item.icon
    })),
    isActive: platformItemsWithBasePath.filter(item => item.group === group.id).some(item => isLinkActive(item.href)),
    icon: group.icon,
  }))

  // Standalone platform items with proper basePath
  const standaloneItemsWithBasePath = platformStandaloneItems.map(item => ({
    ...item,
    href: `${basePath}${item.href}`,
  }))

  return (
    <SidebarComponent collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton asChild>
          <div className="group-has-[[data-collapsible=icon]]/sidebar-wrapper:hidden p-2">
            <Logo />
          </div>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <div className="hidden group-has-[[data-collapsible=icon]]/sidebar-wrapper:block">
            <LogoIcon />
          </div>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent className="no-scrollbar">
        {/* Dashboard Home Link */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isLinkActive('/dashboard')}>
                <Link href="/dashboard" onClick={() => setOpenMobile(false)}>
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Platform Routes - Standalone Items */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu className="gap-0">
            {standaloneItemsWithBasePath.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isLinkActive(item.href)}>
                  <Link href={item.href} onClick={() => setOpenMobile(false)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          {/* Platform Groups */}
          {platformItems.map((platformItem) => (
            <div key={platformItem.title} className="max-h-full overflow-y-auto group-has-[[data-collapsible=icon]]/sidebar-wrapper:hidden">
              <Collapsible
                asChild
                defaultOpen={platformItem.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <platformItem.icon className="h-4 w-4" />
                      <span>{platformItem.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {platformItem.items.map((link) => {
                        const handleClick = () => {
                          setOpenMobile(false)
                        }

                        return (
                          <SidebarMenuSubItem key={link.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isLinkActive(link.href)}
                            >
                              <Link href={link.href} onClick={handleClick}>
                                <span>{link.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </div>
          ))}

          {/* Platform Dropdown - Icon Mode */}
          <SidebarMenu className="hidden group-has-[[data-collapsible=icon]]/sidebar-wrapper:block">
            {/* Standalone Items in Icon Mode */}
            {standaloneItemsWithBasePath.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isLinkActive(item.href)}>
                  <Link href={item.href} onClick={() => setOpenMobile(false)}>
                    <item.icon className="h-4 w-4" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            
            {/* Grouped Items in Icon Mode */}
            {platformItems.map((platformItem) => (
              <DropdownMenu key={platformItem.title}>
                <SidebarMenuItem>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                      <platformItem.icon className="h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                    className="min-w-56"
                  >
                    <div className="max-h-[calc(100vh-16rem)] overflow-y-auto py-1">
                      {platformItem.items.map((link) => {
                        const handleClick = () => {
                          setOpenMobile(false)
                        }

                        return (
                          <DropdownMenuItem
                            asChild
                            key={link.href}
                            className={
                              isLinkActive(link.href)
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }
                          >
                            <Link href={link.href} onClick={handleClick}>
                              <span>{link.title}</span>
                              {isLinkActive(link.href) && (
                                <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                              )}
                            </Link>
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </SidebarMenuItem>
              </DropdownMenu>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Models */}
        <SidebarGroup>
          <SidebarGroupLabel>Models</SidebarGroupLabel>
          <div className="max-h-full overflow-y-auto group-has-[[data-collapsible=icon]]/sidebar-wrapper:hidden">
            <Collapsible
              asChild
              defaultOpen={modelLinks.some(link => isLinkActive(link.href))}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Package className="h-4 w-4" />
                    <span>Models</span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {modelLinks.map((link) => {
                      const handleClick = () => {
                        setOpenMobile(false)
                      }

                      return (
                        <SidebarMenuSubItem key={link.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isLinkActive(link.href)}
                          >
                            <Link href={link.href} onClick={handleClick}>
                              <span>{link.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </div>

          {/* Models Dropdown - Icon Mode */}
          <SidebarMenu className="hidden group-has-[[data-collapsible=icon]]/sidebar-wrapper:block">
            <DropdownMenu>
              <SidebarMenuItem>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <Package className="h-4 w-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                  className="min-w-56"
                >
                  <div className="max-h-[calc(100vh-16rem)] overflow-y-auto py-1">
                    {modelLinks.map((link) => {
                      const handleClick = () => {
                        setOpenMobile(false)
                      }

                      return (
                        <DropdownMenuItem
                          asChild
                          key={link.href}
                          className={
                            isLinkActive(link.href)
                              ? "bg-blue-50 text-blue-600"
                              : ""
                          }
                        >
                          <Link href={link.href} onClick={handleClick}>
                            <span>{link.title}</span>
                            {isLinkActive(link.href) && (
                              <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                </DropdownMenuContent>
              </SidebarMenuItem>
            </DropdownMenu>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        {/* Onboarding Cards */}
        <div className="w-full mb-2 overflow-visible">
          <OnboardingCards
            steps={[{
              href: '#onboarding',
              title: 'Welcome to Openfront',
              description: 'Your store is empty. Click get started to configure your store with products, categories, and regions.',
            }]}
            onboardingStatus={user?.onboardingStatus}
            userRole={user?.role}
            onDismiss={async () => {
              try {
                await dismissOnboarding();
              } catch (error) {
                console.error('Error dismissing onboarding:', error);
              }
            }}
            onOpenDialog={() => setIsOnboardingDialogOpen(true)}
          />
        </div>
        
        {/* User Profile */}
        {user && <UserProfileClient user={user} />}
      </SidebarFooter>
      
      <SidebarRail />
      
      {/* Onboarding Dialog */}
      <OnboardingDialog
        isOpen={isOnboardingDialogOpen}
        onClose={() => setIsOnboardingDialogOpen(false)}
      />
    </SidebarComponent>
  )
}