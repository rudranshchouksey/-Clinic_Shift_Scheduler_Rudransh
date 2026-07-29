'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shiftSchema, type ShiftFormValues } from '../schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface ShiftFormProps {
  initialData?: Partial<ShiftFormValues>
  onSubmit: (data: ShiftFormValues) => Promise<void>
  isLoading: boolean
  submitLabel?: string
}

export function ShiftForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Save Shift',
}: ShiftFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(shiftSchema) as any,
    defaultValues: {
      date: initialData?.date || '',
      startTime: initialData?.startTime || '',
      endTime: initialData?.endTime || '',
      doctorCount: initialData?.doctorCount ?? 1,
      nurseCount: initialData?.nurseCount ?? 1,
      receptionistCount: initialData?.receptionistCount ?? 1,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register('date')} disabled={isLoading} />
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input id="startTime" type="time" {...register('startTime')} disabled={isLoading} />
          {errors.startTime && (
            <p className="text-sm text-destructive">{errors.startTime.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input id="endTime" type="time" {...register('endTime')} disabled={isLoading} />
          {errors.endTime && <p className="text-sm text-destructive">{errors.endTime.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">Role Requirements</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="doctorCount" className="text-xs">
              Doctors
            </Label>
            <Input
              id="doctorCount"
              type="number"
              min="0"
              {...register('doctorCount')}
              disabled={isLoading}
            />
            {errors.doctorCount && (
              <p className="text-xs text-destructive">{errors.doctorCount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nurseCount" className="text-xs">
              Nurses
            </Label>
            <Input
              id="nurseCount"
              type="number"
              min="0"
              {...register('nurseCount')}
              disabled={isLoading}
            />
            {errors.nurseCount && (
              <p className="text-xs text-destructive">{errors.nurseCount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="receptionistCount" className="text-xs">
              Receptionists
            </Label>
            <Input
              id="receptionistCount"
              type="number"
              min="0"
              {...register('receptionistCount')}
              disabled={isLoading}
            />
            {errors.receptionistCount && (
              <p className="text-xs text-destructive">{errors.receptionistCount.message}</p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  )
}
