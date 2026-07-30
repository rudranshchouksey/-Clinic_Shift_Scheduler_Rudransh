'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, CalendarIcon, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

import { createShift, updateShift, deleteShift } from '@/server/actions/shifts'
import { shiftFormSchema, ShiftFormValues } from '@/lib/schemas'
import { toast } from 'sonner'

export function ManagerShiftsClient({
  initialShifts,
}: {
  initialShifts: {
    id: string
    date: Date | string
    startTime: Date | string
    endTime: Date | string
    requirements: { id: string; profession: string; count: number }[]
    claims: { id: string }[]
  }[]
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      requirements: [{ profession: 'DOCTOR', count: 1 }],
      startTime: '09:00',
      endTime: '17:00',
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: 'requirements',
    control: form.control,
  })

  const handleEdit = (shift: {
    id: string
    date: Date | string
    startTime: Date | string
    endTime: Date | string
    requirements: { profession: string; count: number }[]
  }) => {
    setEditingId(shift.id)
    form.reset({
      date: new Date(shift.date),
      startTime: format(new Date(shift.startTime), 'HH:mm'),
      endTime: format(new Date(shift.endTime), 'HH:mm'),
      requirements: shift.requirements.map((r: { profession: string; count: number }) => ({
        profession: r.profession as 'DOCTOR' | 'NURSE' | 'RECEPTIONIST',
        count: r.count,
      })),
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return
    setIsPending(true)
    const result = await deleteShift(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Shift deleted')
    }
    setIsPending(false)
  }

  const onSubmit = async (data: ShiftFormValues) => {
    setIsPending(true)
    const result = editingId ? await updateShift(editingId, data) : await createShift(data)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(editingId ? 'Shift updated' : 'Shift created')
      setIsOpen(false)
      form.reset()
      setEditingId(null)
    }
    setIsPending(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Shifts</CardTitle>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) {
              form.reset()
              setEditingId(null)
            }
          }}
        >
          <DialogTrigger render={<Button size="sm" className="h-8 gap-1" />}>
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Shift</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Shift' : 'Create Shift'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="outline"
                              className={cn(
                                'w-[240px] pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            />
                          }
                        >
                          <FormControl>
                            <span>
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </span>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <FormLabel>Requirements</FormLabel>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`requirements.${index}.profession`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DOCTOR">Doctor</SelectItem>
                                <SelectItem value="NURSE">Nurse</SelectItem>
                                <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`requirements.${index}.count`}
                        render={({ field }) => (
                          <FormItem className="w-20">
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ profession: 'NURSE', count: 1 })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Requirement
                  </Button>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Shift
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialShifts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No shifts found. Create one!
                </TableCell>
              </TableRow>
            )}
            {initialShifts.map((shift) => {
              let totalRequired = 0
              const totalClaimed = shift.claims.length
              shift.requirements.forEach((r: { count: number }) => {
                totalRequired += r.count
              })
              const isFilled = totalClaimed >= totalRequired

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
                    <div className="flex gap-1 flex-wrap">
                      {shift.requirements.map(
                        (r: { id: string; profession: string; count: number }) => (
                          <Badge key={r.id} variant="secondary">
                            {r.profession.slice(0, 1) + r.profession.slice(1).toLowerCase()}:{' '}
                            {r.count}
                          </Badge>
                        ),
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isFilled ? 'default' : 'destructive'}>
                      {totalClaimed} / {totalRequired} Filled
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(shift)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(shift.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
