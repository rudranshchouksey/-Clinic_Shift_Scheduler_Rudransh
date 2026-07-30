'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarDays, LayoutDashboard, Menu, Search, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '../theme-toggle'
import { authClient } from '@/lib/auth-client'

const staffNavItems = [
  { href: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/staff/shifts', icon: Search, label: 'Browse Shifts' },
]

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* ─── Top Navigation ─── */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        {/* Desktop Logo + Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarDays className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">ClinicSync</span>
          </Link>
          <nav className="flex items-center gap-1">
            {staffNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-foreground bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="shrink-0 md:hidden" />}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex h-14 items-center gap-3 border-b px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold">ClinicSync</span>
                <Badge variant="secondary" className="ml-2 text-[10px] py-0">
                  Staff
                </Badge>
              </div>
            </div>
            <nav className="grid gap-0.5 p-3 mt-2">
              {staffNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                    )}
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold">ClinicSync</span>
        </Link>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1" />}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {session.user.name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="capitalize">
                  <Badge variant="secondary" className="text-[10px] py-0 mr-2">
                    {(
                      (session.user as unknown as { profession?: string }).profession || ''
                    ).toLowerCase()}
                  </Badge>
                  Staff Member
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* ─── Page Content ─── */}
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">{children}</main>
    </div>
  )
}
