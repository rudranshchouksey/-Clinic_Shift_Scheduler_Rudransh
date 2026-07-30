import { ReactNode } from 'react'
import { requireAuth } from '@/lib/auth-utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { Activity } from 'lucide-react'
import Link from 'next/link'
import { Role } from '@prisma/client'
import { UserNav } from './_components/user-nav'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-background transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="hidden font-bold sm:inline-block tracking-tight text-lg">
                ClinicShift
              </span>
            </Link>

            {session.user.role === Role.MANAGER && (
              <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
                <Link
                  href="/dashboard"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Overview
                </Link>
                <Link
                  href="/dashboard/import-report"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Import Reports
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav user={session.user} />
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  )
}
