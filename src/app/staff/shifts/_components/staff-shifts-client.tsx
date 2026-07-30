'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { claimShift, unclaimShift } from '@/server/actions/shifts'
import { toast } from 'sonner'

export function StaffShiftsClient({
  initialShifts,
  userId,
  userProfession,
}: {
  initialShifts: {
    id: string
    date: Date | string
    startTime: Date | string
    endTime: Date | string
    requirements: { profession: string; count: number }[]
    claims: { userId: string; user: { profession: string } }[]
  }[]
  userId: string
  userProfession: string
}) {
  const [isPending, setIsPending] = React.useState(false)

  const handleClaim = async (id: string) => {
    setIsPending(true)
    const res = await claimShift(id)
    if (res.error) toast.error(res.error)
    else toast.success('Shift claimed successfully')
    setIsPending(false)
  }

  const handleUnclaim = async (id: string) => {
    setIsPending(true)
    const res = await unclaimShift(id)
    if (res.error) toast.error(res.error)
    else toast.success('Shift unclaimed')
    setIsPending(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Available {userProfession.slice(0, 1) + userProfession.slice(1).toLowerCase()} Shifts
        </CardTitle>
        <CardDescription>Only showing shifts that require your profession.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Your Role Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialShifts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  No shifts available for your profession in the next 30 days.
                </TableCell>
              </TableRow>
            )}
            {initialShifts.map((shift) => {
              const req = shift.requirements.find(
                (r: { profession: string; count: number }) => r.profession === userProfession,
              )
              if (!req) return null // Should be filtered by DB anyway

              const currentClaims = shift.claims.filter(
                (c: { user: { profession: string } }) => c.user.profession === userProfession,
              )
              const isFilled = currentClaims.length >= req.count
              const hasClaimed = shift.claims.some((c: { userId: string }) => c.userId === userId)

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
                    <Badge
                      variant={hasClaimed ? 'default' : isFilled ? 'secondary' : 'outline'}
                      className={isFilled && !hasClaimed ? 'opacity-50' : ''}
                    >
                      {currentClaims.length} / {req.count} Filled
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {hasClaimed ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUnclaim(shift.id)}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4 mr-1" /> Unclaim
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleClaim(shift.id)}
                        disabled={isPending || isFilled}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Claim
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
