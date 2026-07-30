'use client'

import { LogOut, FileText, CalendarRange } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Role } from '@prisma/client'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface UserNavProps {
  user: {
    email: string
    role: string
    profession?: string | null
  }
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        },
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-8 w-8 border border-muted-foreground/20 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarFallback className="text-xs uppercase bg-primary/10 text-primary">
            {user.email.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.role} {user.profession ? `• ${user.profession}` : ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {user.role === Role.MANAGER && (
          <>
            <DropdownMenuItem asChild className="md:hidden cursor-pointer">
              <Link href="/dashboard">
                <CalendarRange className="mr-2 h-4 w-4" />
                <span>Overview</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden cursor-pointer">
              <Link href="/dashboard/import-report">
                <FileText className="mr-2 h-4 w-4" />
                <span>Import Reports</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="md:hidden" />
          </>
        )}

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
