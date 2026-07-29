import { getShifts } from '@/features/shifts/queries'
import { ShiftList } from '@/features/shifts/components/ShiftList'
import { ShiftDialog } from '@/features/shifts/components/ShiftDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const metadata = {
  title: 'Shift Management | Clinic Scheduler',
}

export default async function ShiftsPage() {
  const shifts = await getShifts()

  return (
    <div className="p-6 md:p-8 w-full max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shifts</h1>
          <p className="text-muted-foreground mt-1">
            Manage clinic shifts and staffing requirements.
          </p>
        </div>

        <ShiftDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Shift
          </Button>
        </ShiftDialog>
      </div>

      <ShiftList shifts={shifts} />
    </div>
  )
}
