'use client'

import { format } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle } from 'lucide-react'
import { useTransition } from 'react'
import { claimShift, unclaimShift } from '@/server/actions/shifts'
import { toast } from 'sonner'
import { Prisma } from '@prisma/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type ShiftWithRequirements = Prisma.ShiftGetPayload<{
  include: {
    requirements: true
  }
}>

interface ShiftCardProps {
  shift: ShiftWithRequirements
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
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-muted-foreground/10 dark:bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-muted/40 dark:bg-muted/10 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg tracking-tight">
              {format(shift.date, 'EEEE, MMM do')}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>
                {format(shift.startTime, 'h:mm a')} - {format(shift.endTime, 'h:mm a')}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Roles Required</p>
          <div className="flex flex-wrap gap-2">
            {shift.requirements.map((req) => (
              <span
                key={req.id}
                className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-md"
              >
                {req.profession}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {isClaimed ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" className="w-full relative overflow-hidden group">
                  <span className={cn('transition-all', isPending && 'opacity-0')}>Drop Shift</span>
                  {isPending && <Loader2 className="w-4 h-4 animate-spin absolute" />}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will unclaim the shift and make it available to other staff members. You
                  might not be able to claim it back.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDrop}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Drop Shift
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="w-full">
                    <Button
                      className="w-full relative group transition-all"
                      disabled={hasConflict || isPending}
                      onClick={handleClaim}
                    >
                      <span
                        className={cn(
                          'flex items-center gap-2 transition-all',
                          isPending && 'opacity-0',
                        )}
                      >
                        {hasConflict && <AlertTriangle className="w-4 h-4" />}
                        Claim Shift
                      </span>
                      {isPending && <Loader2 className="w-4 h-4 animate-spin absolute" />}
                    </Button>
                  </div>
                }
              />
              {hasConflict && (
                <TooltipContent
                  side="top"
                  className="bg-destructive text-destructive-foreground border-destructive"
                >
                  <p>You have a scheduling conflict at this time.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </CardFooter>
    </Card>
  )
}
