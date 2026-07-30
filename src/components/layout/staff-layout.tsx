'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, LayoutDashboard, Menu, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { UserNav } from './user-nav'
import { ThemeToggle } from '../theme-toggle'

const staffNavItems = [
  { href: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/staff/shifts', icon: Search, label: 'Browse Shifts' },
]

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <CalendarDays className="h-6 w-6 text-primary" />
            <span className="sr-only">ClinicSync</span>
          </Link>
          {staffNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-foreground ${
                pathname === item.href ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" size="icon" className="shrink-0 md:hidden" />}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium mt-6">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <CalendarDays className="h-6 w-6 text-primary" />
                <span className="sr-only">ClinicSync</span>
              </Link>
              {staffNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:text-foreground ${
                    pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial"></div>
          <ThemeToggle />
          <UserNav />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
    </div>
  )
}
