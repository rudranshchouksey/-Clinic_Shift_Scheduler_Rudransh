'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ShiftForm } from './ShiftForm'
import { ShiftFormValues } from '../schema'
import { toast } from 'sonner'
import { createShift, updateShift } from '../actions'

interface ShiftDialogProps {
  children: React.ReactNode
  shift?: ShiftFormValues & { id: string }
}

export function ShiftDialog({ children, shift }: ShiftDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isEdit = !!shift

  const handleSubmit = async (data: ShiftFormValues) => {
    setIsLoading(true)
    try {
      if (isEdit) {
        await updateShift(shift.id, data)
        toast.success('Shift updated successfully')
      } else {
        await createShift(data)
        toast.success('Shift created successfully')
      }
      setOpen(false)
    } catch (e) {
      console.error(e)
      toast.error('Failed to save shift')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Shift' : 'Create Shift'}</DialogTitle>
        </DialogHeader>
        <ShiftForm
          initialData={shift}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel={isEdit ? 'Save Changes' : 'Create Shift'}
        />
      </DialogContent>
    </Dialog>
  )
}
