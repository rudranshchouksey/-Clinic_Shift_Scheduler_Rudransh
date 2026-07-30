import { z } from 'zod'

export const shiftRequirementSchema = z.object({
  profession: z.enum(['DOCTOR', 'NURSE', 'RECEPTIONIST']),
  count: z.number().min(1),
})

export const shiftFormSchema = z
  .object({
    date: z.date(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    requirements: z.array(shiftRequirementSchema).min(1, 'At least one requirement is needed'),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const [startH, startM] = data.startTime.split(':').map(Number)
        const [endH, endM] = data.endTime.split(':').map(Number)
        const startMins = startH * 60 + startM
        const endMins = endH * 60 + endM
        return startMins < endMins
      }
      return true
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  )

export type ShiftFormValues = z.infer<typeof shiftFormSchema>
