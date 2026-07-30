'use client'

import { addWeeks, format, parse, startOfWeek, subWeeks, isValid } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'

interface WeekNavigationProps {
  currentWeekStart: Date
}

export function WeekNavigation({ currentWeekStart }: WeekNavigationProps) {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(currentWeekStart)

  const goToWeek = (dateToNavigate: Date) => {
    const weekStart = startOfWeek(dateToNavigate, { weekStartsOn: 1 }) // Monday start
    const dateStr = format(weekStart, 'yyyy-MM-dd')
    router.push(`/dashboard?week=${dateStr}`)
  }

  const prevWeek = () => {
    goToWeek(subWeeks(currentWeekStart, 1))
  }

  const nextWeek = () => {
    goToWeek(addWeeks(currentWeekStart, 1))
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      goToWeek(selectedDate)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={prevWeek}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-[240px] justify-start text-left font-normal',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(currentWeekStart, 'MMM d, yyyy')} -{' '}
          {format(addWeeks(currentWeekStart, 1), 'MMM d, yyyy')}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar mode="single" selected={date} onSelect={handleDateSelect} />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={nextWeek}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
