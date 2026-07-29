'use client'

import { useState } from 'react'
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
import { Edit2, Trash2, UserPlus, CheckCircle2, Loader2 } from 'lucide-react'
import { ShiftDialog } from './ShiftDialog'
import { DeleteShiftDialog } from './DeleteShiftDialog'
import { AssignStaffDialog } from './AssignStaffDialog'
import { Profession } from '@prisma/client'
import { claimShift } from '../claim-actions'
import { toast } from 'sonner'

type ShiftWithRelations = {
  id: string
  date: Date
  startTime: Date
  endTime: Date
  requirements: {
    profession: Profession
    count: number
  }[]
  claims: {
    userId: string
    user: {
      id: string
      name: string
      profession: Profession | null
    }
  }[]
}

interface ShiftListProps {
  shifts: ShiftWithRelations[]
  userRole: 'MANAGER' | 'STAFF'
  userId: string
  userProfession?: Profession | null
  staffUsers?: { id: string; name: string; profession: Profession | null }[]
}

export function ShiftList({
  shifts,
  userRole,
  userId,
  userProfession,
  staffUsers = [],
}: ShiftListProps) {
  const [claimingShiftId, setClaimingShiftId] = useState<string | null>(null)

  const handleClaim = async (shiftId: string) => {
    setClaimingShiftId(shiftId)
    try {
      const result = await claimShift(shiftId)
      if (result.success) {
        toast.success('Shift claimed successfully')
      } else {
        toast.error(result.error || 'Failed to claim shift')
      }
    } catch (e) {
      console.error(e)
      toast.error('An unexpected error occurred')
    } finally {
      setClaimingShiftId(null)
    }
  }

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

            const totalRequired = doctors + nurses + receptionists

            const hasClaimed = shift.claims.some((c) => c.userId === userId)

            let canClaim = false
            if (userRole === 'STAFF' && userProfession) {
              const reqCountForUser =
                shift.requirements.find((r) => r.profession === userProfession)?.count || 0
              const currentCountForUser = shift.claims.filter(
                (c) => c.user.profession === userProfession,
              ).length
              canClaim = reqCountForUser > 0 && currentCountForUser < reqCountForUser && !hasClaimed
            }

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
                  {shift.claims.length} / {totalRequired}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {userRole === 'MANAGER' ? (
                      <>
                        <AssignStaffDialog shiftId={shift.id} staffUsers={staffUsers}>
                          <Button variant="outline" size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign
                          </Button>
                        </AssignStaffDialog>
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
                      </>
                    ) : // Staff View Actions
                    hasClaimed ? (
                      <Button variant="secondary" size="sm" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                        Claimed
                      </Button>
                    ) : canClaim ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleClaim(shift.id)}
                        disabled={claimingShiftId === shift.id}
                      >
                        {claimingShiftId === shift.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Claim Shift
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Unavailable
                      </Button>
                    )}
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
