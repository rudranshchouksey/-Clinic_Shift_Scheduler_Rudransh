import * as z from 'zod'

export const shiftSchema = z
  .object({
    id: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    doctorCount: z.coerce.number().min(0, 'Cannot be negative'),
    nurseCount: z.coerce.number().min(0, 'Cannot be negative'),
    receptionistCount: z.coerce.number().min(0, 'Cannot be negative'),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time if on the same day.
      // Since time is just HH:mm string, we can do a simple string comparison
      return data.endTime > data.startTime
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  )

export type ShiftFormValues = z.infer<typeof shiftSchema>
