'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { assignShift } from '../claim-actions'
import { toast } from 'sonner'
import { Loader2, UserPlus } from 'lucide-react'

interface AssignStaffDialogProps {
  shiftId: string
  staffUsers: {
    id: string
    name: string
    profession: string | null
  }[]
  children: React.ReactNode
}

export function AssignStaffDialog({ shiftId, staffUsers, children }: AssignStaffDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  const handleAssign = async () => {
    if (!selectedUserId) return
    setIsLoading(true)
    try {
      const result = await assignShift(shiftId, selectedUserId)
      if (result.success) {
        toast.success('Staff assigned successfully')
        setOpen(false)
        setSelectedUserId('')
      } else {
        toast.error(result.error || 'Failed to assign staff')
      }
    } catch (e) {
      console.error(e)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Staff to Shift</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Select
            value={selectedUserId}
            onValueChange={(val) => setSelectedUserId(val || '')}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a staff member" />
            </SelectTrigger>
            <SelectContent>
              {staffUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.profession?.toLowerCase() || 'no profession'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="w-full" onClick={handleAssign} disabled={!selectedUserId || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Assign Staff
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
