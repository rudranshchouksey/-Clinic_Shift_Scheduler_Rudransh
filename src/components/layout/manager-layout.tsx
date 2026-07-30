'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Upload,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '../theme-toggle'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const navSections = [
  {
    label: 'Overview',
    items: [{ href: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'Scheduling',
    items: [
      { href: '/manager/shifts', icon: CalendarDays, label: 'Shifts' },
      { href: '/manager/coverage', icon: ShieldCheck, label: 'Coverage' },
    ],
  },
  {
    label: 'Data',
    items: [
      { href: '/manager/imports', icon: Upload, label: 'Import CSV' },
      { href: '/manager/import-report', icon: FileSpreadsheet, label: 'Reports' },
    ],
  },
]

function SidebarNav({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  return (
    <div className="flex-1 overflow-y-auto py-4 px-3">
      {navSections.map((section, idx) => (
        <div key={section.label} className={idx > 0 ? 'mt-6' : ''}>
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {section.label}
            </p>
          )}
          {collapsed && idx > 0 && <Separator className="mb-3" />}
          <nav className="grid gap-0.5">
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                  )}
                  <item.icon className={`shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger render={<div />}>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <React.Fragment key={item.href}>{linkContent}</React.Fragment>
            })}
          </nav>
        </div>
      ))}
    </div>
  )
}

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [collapsed, setCollapsed] = React.useState(false)

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className={`hidden md:flex flex-col border-r bg-sidebar transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-[260px]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex h-14 items-center border-b px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}
        >
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight truncate">ClinicSync</span>
                <span className="text-[10px] text-muted-foreground font-medium">Manager</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link
              href="/"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <CalendarDays className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <SidebarNav collapsed={collapsed} pathname={pathname} />

        {/* Footer */}
        <div className="border-t p-3">
          {!collapsed && session && (
            <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={session.user.image || ''} />
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  {session.user.name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{session.user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 text-muted-foreground hover:text-foreground ${collapsed ? 'mx-auto' : 'mt-1'}`}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="shrink-0 md:hidden" />}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[280px] p-0">
              <div className="flex h-14 items-center gap-3 border-b px-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-bold">ClinicSync</span>
                  <Badge variant="secondary" className="ml-2 text-[10px] py-0">
                    Manager
                  </Badge>
                </div>
              </div>
              <SidebarNav collapsed={false} pathname={pathname} />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb / Page context */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {navSections
                .flatMap((s) => s.items)
                .find((i) => pathname === i.href || pathname.startsWith(i.href + '/'))?.label ||
                'Dashboard'}
            </span>
          </div>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {session && (
              <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session.user.image || ''} />
                  <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                    {session.user.name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
