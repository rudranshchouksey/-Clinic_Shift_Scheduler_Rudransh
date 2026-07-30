'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Plus, X, CalendarDays, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    claims: { userId: string; user: { profession: string | null } }[]
  }[]
  userId: string
  userProfession: string
}) {
  const [loadingId, setLoadingId] = React.useState<string | null>(null)

  const handleClaim = async (id: string) => {
    setLoadingId(`claim-${id}`)
    const res = await claimShift(id)
    if (res.error) toast.error(res.error)
    else toast.success('Shift claimed successfully')
    setLoadingId(null)
  }

  const handleUnclaim = async (id: string) => {
    setLoadingId(`unclaim-${id}`)
    const res = await unclaimShift(id)
    if (res.error) toast.error(res.error)
    else toast.success('Shift unclaimed')
    setLoadingId(null)
  }

  return (
    <Card>
      <CardContent className="p-0">
        {initialShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="p-4 rounded-2xl bg-muted/50 mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No shifts available</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              There are no available shifts for your role in the next 30 days. Check back later!
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Time</TableHead>
                <TableHead className="font-semibold">Your Role Status</TableHead>
                <TableHead className="text-right font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialShifts.map((shift) => {
                const req = shift.requirements.find(
                  (r: { profession: string; count: number }) => r.profession === userProfession,
                )
                if (!req) return null // Should be filtered by DB anyway

                const currentClaims = shift.claims.filter(
                  (c: { user: { profession: string | null } }) =>
                    c.user.profession === userProfession,
                )
                const isFilled = currentClaims.length >= req.count
                const hasClaimed = shift.claims.some((c: { userId: string }) => c.userId === userId)

                return (
                  <TableRow
                    key={shift.id}
                    className={`group ${hasClaimed ? 'bg-primary/5 hover:bg-primary/5' : ''}`}
                  >
                    <TableCell className="font-medium">
                      {format(new Date(shift.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(shift.startTime), 'HH:mm')} –{' '}
                      {format(new Date(shift.endTime), 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={hasClaimed ? 'default' : isFilled ? 'secondary' : 'outline'}
                        className={
                          isFilled && !hasClaimed
                            ? 'opacity-50 text-xs font-medium'
                            : 'text-xs font-medium'
                        }
                      >
                        {currentClaims.length} / {req.count} Filled
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {hasClaimed ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-0 shadow-none transition-colors"
                          onClick={() => handleUnclaim(shift.id)}
                          disabled={loadingId === `unclaim-${shift.id}`}
                        >
                          {loadingId === `unclaim-${shift.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Unclaim
                        </Button>
                      ) : (
                        <Button
                          variant={isFilled ? 'secondary' : 'default'}
                          size="sm"
                          className="h-8"
                          onClick={() => handleClaim(shift.id)}
                          disabled={isFilled || loadingId === `claim-${shift.id}`}
                        >
                          {loadingId === `claim-${shift.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Claim
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
