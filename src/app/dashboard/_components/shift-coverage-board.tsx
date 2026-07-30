'use client'

import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { calculateShiftStaffing, ShiftStaffingSummary } from '@/lib/shift-utils'
import { ShiftWithRelations } from '@/server/queries/shifts'

interface ShiftCoverageBoardProps {
  shifts: ShiftWithRelations[]
}

function StatusBadge({ status }: { status: ShiftStaffingSummary['status'] }) {
  switch (status) {
    case 'FULL':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
          Fully Staffed
        </Badge>
      )
    case 'PARTIAL':
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600/30 bg-yellow-500/10">
          Partially Staffed
        </Badge>
      )
    case 'EMPTY':
      return <Badge variant="destructive">Empty</Badge>
  }
}

export function ShiftCoverageBoard({ shifts }: ShiftCoverageBoardProps) {
  if (shifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-xl border-dashed bg-muted/20">
        <p className="text-muted-foreground text-lg">No shifts scheduled for this week.</p>
      </div>
    )
  }

  const shiftsWithStaffing = shifts.map((shift) => ({
    ...shift,
    staffing: calculateShiftStaffing(shift),
  }))

  return (
    <div className="w-full">
      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {shiftsWithStaffing.map((shift) => (
          <Card key={shift.id} className="bg-background/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{format(shift.date, 'EEEE, MMM d')}</CardTitle>
                  <CardDescription className="text-sm font-medium text-foreground">
                    {format(shift.startTime, 'HH:mm')} - {format(shift.endTime, 'HH:mm')}
                  </CardDescription>
                </div>
                <StatusBadge status={shift.staffing.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Required:</span>
                  <span className="font-medium">{shift.staffing.totalRequired}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-medium">{shift.staffing.totalClaimed}</span>
                </div>
                {shift.staffing.totalMissing > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                      Missing Roles
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(shift.staffing.missingCounts).map(([role, count]) => {
                        if (count === 0) return null
                        return (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="bg-red-500/10 text-red-600 text-[10px]"
                          >
                            {count} {role}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View: Table */}
      <Card className="hidden md:block bg-background/60 backdrop-blur-md border-muted">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead className="w-[140px]">Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Required</TableHead>
                <TableHead className="text-center">Current</TableHead>
                <TableHead>Missing Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftsWithStaffing.map((shift) => (
                <TableRow key={shift.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{format(shift.date, 'EEEE, MMM d')}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(shift.startTime, 'HH:mm')} - {format(shift.endTime, 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={shift.staffing.status} />
                  </TableCell>
                  <TableCell className="text-center">{shift.staffing.totalRequired}</TableCell>
                  <TableCell className="text-center">{shift.staffing.totalClaimed}</TableCell>
                  <TableCell>
                    {shift.staffing.totalMissing === 0 ? (
                      <span className="text-muted-foreground text-sm">-</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(shift.staffing.missingCounts).map(([role, count]) => {
                          if (count === 0) return null
                          return (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="bg-red-500/10 text-red-600"
                            >
                              {count} {role}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
