'use client'

import { format } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useTransition } from 'react'
import { claimShift, unclaimShift } from '@/server/actions/shifts'
import { toast } from 'sonner'

import { Shift } from '@prisma/client'

interface ShiftCardProps {
  shift: Shift
  isClaimed: boolean
  hasConflict: boolean
}

export function ShiftCard({ shift, isClaimed, hasConflict }: ShiftCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleClaim = () => {
    startTransition(async () => {
      try {
        await claimShift(shift.id)
        toast.success('Shift claimed successfully!')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to claim shift')
      }
    })
  }

  const handleDrop = () => {
    startTransition(async () => {
      try {
        await unclaimShift(shift.id)
        toast.success('Shift dropped successfully!')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to drop shift')
      }
    })
  }

  return (
    <Card
      className={`relative overflow-hidden ${isClaimed ? 'border-emerald-500/30 bg-emerald-500/5' : 'bg-background/60 backdrop-blur-md'}`}
    >
      {isClaimed && (
        <div className="absolute top-0 right-0 p-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-50" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="space-y-1">
          <CardTitle className="text-lg">{format(shift.date, 'EEEE, MMM d')}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground font-medium">
            <Clock className="w-4 h-4 mr-1.5" />
            {format(shift.startTime, 'HH:mm')} - {format(shift.endTime, 'HH:mm')}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {hasConflict && !isClaimed && (
          <div className="flex items-start gap-2 mt-2 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-500 font-medium leading-relaxed">
              This shift overlaps with another shift you have already claimed.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {isClaimed ? (
          <Button
            variant="destructive"
            className="w-full bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0"
            onClick={handleDrop}
            disabled={isPending}
          >
            {isPending ? 'Dropping...' : 'Drop Shift'}
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={handleClaim}
            disabled={isPending || hasConflict}
          >
            {isPending ? 'Claiming...' : 'Claim Shift'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
