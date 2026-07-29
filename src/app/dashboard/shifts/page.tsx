import { getShifts, getStaffUsers } from '@/features/shifts/queries'
import { ShiftList } from '@/features/shifts/components/ShiftList'
import { ShiftDialog } from '@/features/shifts/components/ShiftDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { auth } from '@/server/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Profession } from '@prisma/client'

export const metadata = {
  title: 'Shift Management | Clinic Scheduler',
}

export default async function ShiftsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  const shifts = await getShifts()
  const isManager = session.user.role === 'MANAGER'
  const staffUsers = isManager ? await getStaffUsers() : []

  return (
    <div className="p-6 md:p-8 w-full max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shifts</h1>
          <p className="text-muted-foreground mt-1">
            {isManager
              ? 'Manage clinic shifts and staffing requirements.'
              : 'View and claim upcoming clinic shifts.'}
          </p>
        </div>

        {isManager && (
          <ShiftDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Shift
            </Button>
          </ShiftDialog>
        )}
      </div>

      <ShiftList
        shifts={shifts}
        userRole={session.user.role as 'MANAGER' | 'STAFF'}
        userId={session.user.id}
        userProfession={session.user.profession as Profession | null}
        staffUsers={staffUsers}
      />
    </div>
  )
}
