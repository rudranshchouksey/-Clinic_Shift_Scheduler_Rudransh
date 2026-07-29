'use client'

import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import { ShiftDialog } from './ShiftDialog'
import { DeleteShiftDialog } from './DeleteShiftDialog'
import { Profession } from '@prisma/client'

type ShiftWithRelations = {
  id: string
  date: Date
  startTime: Date
  endTime: Date
  requirements: {
    profession: Profession
    count: number
  }[]
  claims: unknown[]
}

interface ShiftListProps {
  shifts: ShiftWithRelations[]
}

export function ShiftList({ shifts }: ShiftListProps) {
  if (shifts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
        No shifts found. Create your first shift above!
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Requirements</TableHead>
            <TableHead>Claims</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => {
            const doctors = shift.requirements.find((r) => r.profession === 'DOCTOR')?.count || 0
            const nurses = shift.requirements.find((r) => r.profession === 'NURSE')?.count || 0
            const receptionists =
              shift.requirements.find((r) => r.profession === 'RECEPTIONIST')?.count || 0

            return (
              <TableRow key={shift.id}>
                <TableCell className="font-medium">
                  {format(new Date(shift.date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(shift.startTime), 'HH:mm')} -{' '}
                  {format(new Date(shift.endTime), 'HH:mm')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    {doctors > 0 && <span>👨‍⚕️ {doctors}</span>}
                    {nurses > 0 && <span>🩺 {nurses}</span>}
                    {receptionists > 0 && <span>🛎️ {receptionists}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  {shift.claims.length} / {doctors + nurses + receptionists}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ShiftDialog
                      shift={{
                        id: shift.id,
                        date: format(new Date(shift.date), 'yyyy-MM-dd'),
                        startTime: format(new Date(shift.startTime), 'HH:mm'),
                        endTime: format(new Date(shift.endTime), 'HH:mm'),
                        doctorCount: doctors,
                        nurseCount: nurses,
                        receptionistCount: receptionists,
                      }}
                    >
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </ShiftDialog>

                    <DeleteShiftDialog shiftId={shift.id}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </DeleteShiftDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
