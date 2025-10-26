'use client'

import { useEffect, useState } from 'react'
import { addWeeks, format, startOfWeek } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchPastShifts, updateShiftStatus, updateShiftTimes } from '@/utils/supabaseClient'
import { Shift } from '@/lib/definitions'
import WeekNavigator from '../WeekNavigator'
import { toast } from 'sonner'
import { useSupabaseData } from '@/contexts/SupabaseContext'

interface PastShift extends Shift {
  end_time: string;
}

export default function ApprovalCard() {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date()
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 })
    return startOfThisWeek
  })
  const [pastShifts, setPastShifts] = useState<PastShift[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedShift, setSelectedShift] = useState<PastShift | null>(null)
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false)
  const [modifiedStartTime, setModifiedStartTime] = useState('')
  const [modifiedEndTime, setModifiedEndTime] = useState('')
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const { employees } = useSupabaseData()

  useEffect(() => {
    const loadPastShifts = async () => {
      setIsLoading(true)
      try {
        const shifts = await fetchPastShifts(currentWeek)
        if (shifts) {
          // Filter and type cast to ensure we have the required fields
          const typedShifts = shifts
            .filter((shift): shift is PastShift => 
              shift.user_id != null && 
              shift.end_time != null &&
              shift.start_time != null &&
              shift.date != null
            )
            .map(shift => ({
              ...shift,
              status: shift.status || 'pending' // Default to pending if no status
            }))
          setPastShifts(typedShifts)
        } else {
          setPastShifts([])
        }
      } catch (error) {
        console.error('Error loading past shifts:', error)
        toast.error('Failed to load shifts')
        setPastShifts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPastShifts()
  }, [currentWeek])

  const handleApprove = async (shift: PastShift) => {
    if (!shift.id) {
      toast.error('Invalid shift ID')
      return
    }

    setIsUpdating(shift.id)
    try {
      await updateShiftStatus(shift.id, 'approved')
      
      // Update local state
      setPastShifts(prev => 
        prev.map(s => s.id === shift.id ? { ...s, status: 'approved' } : s)
      )
      toast.success('Shift approved successfully')
    } catch (error) {
      console.error('Error approving shift:', error)
      toast.error('Failed to approve shift')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleModifyTimeOpen = (shift: PastShift) => {
    setSelectedShift(shift)
    setModifiedStartTime(shift.start_time)
    setModifiedEndTime(shift.end_time)
    setModifyDialogOpen(true)
  }

  const handleModifyTimeSubmit = async () => {
    if (!selectedShift || !selectedShift.id) {
      toast.error('Invalid shift selected')
      return
    }

    // Validate time inputs
    if (!modifiedStartTime || !modifiedEndTime) {
      toast.error('Please provide both start and end times')
      return
    }

    // Check if end time is after start time
    const startTime = new Date(`2000-01-01T${modifiedStartTime}`)
    const endTime = new Date(`2000-01-01T${modifiedEndTime}`)
    if (endTime <= startTime) {
      toast.error('End time must be after start time')
      return
    }

    setIsUpdating(selectedShift.id)
    try {
      await updateShiftTimes(selectedShift.id, modifiedStartTime, modifiedEndTime, 'approved')
      
      // Update local state
      setPastShifts(prev => 
        prev.map(s => s.id === selectedShift.id ? {
          ...s,
          start_time: modifiedStartTime,
          end_time: modifiedEndTime,
          status: 'approved'
        } : s)
      )
      
      toast.success('Shift times updated and approved')
      setModifyDialogOpen(false)
      setSelectedShift(null)
    } catch (error) {
      console.error('Error updating shift times:', error)
      toast.error('Failed to update shift times')
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending':
      default:
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Pending</Badge>
    }
  }

  const formatTime = (time: string) => {
    try {
      return format(new Date(`2000-01-01T${time}`), 'HH:mm')
    } catch {
      return time
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEE, MMM d')
    } catch {
      return dateString
    }
  }

  return (
    <div className='py-6'>
      <Card>
        <CardHeader>
          <CardTitle>Approval for Week of {format(currentWeek, 'MMMM d, yyyy')}</CardTitle>
          <CardDescription>Review and approve employee shifts for the selected week</CardDescription>
        </CardHeader>
        <CardContent>
          <WeekNavigator currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p>Loading shifts...</p>
            </div>
          ) : pastShifts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No shifts found for this week</p>
            </div>
          ) : (
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastShifts.map((shift) => {
                    // Calculate duration in hours
                    const startTime = new Date(`2000-01-01T${shift.start_time}`)
                    const endTime = new Date(`2000-01-01T${shift.end_time}`)
                    const durationMs = endTime.getTime() - startTime.getTime()
                    const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100
                    const isUpdatingThisShift = isUpdating === shift.id
                    const employee=employees?.find(e=>e.id===shift.user_id)
                    return (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">
                          {formatDate(shift.date)}
                        </TableCell>
                        <TableCell>{`${employee?.first_name} ${employee?.last_name}`}</TableCell>
                        <TableCell>{formatTime(shift.start_time)}</TableCell>
                        <TableCell>{formatTime(shift.end_time)}</TableCell>
                        <TableCell>{durationHours}h</TableCell>
                        <TableCell>{getStatusBadge(shift.status || 'pending')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {shift.status !== 'approved' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(shift)}
                                  disabled={isUpdatingThisShift}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  {isUpdatingThisShift ? 'Approving...' : 'Approve'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleModifyTimeOpen(shift)}
                                  disabled={isUpdatingThisShift}
                                >
                                  Modify & Approve
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modify Time Dialog */}
      <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Shift Times</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time" className="text-right">
                Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={modifiedStartTime}
                onChange={(e) => setModifiedStartTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time" className="text-right">
                End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={modifiedEndTime}
                onChange={(e) => setModifiedEndTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleModifyTimeSubmit} 
              disabled={selectedShift ? isUpdating === selectedShift.id : false}
              className="bg-green-500 hover:bg-green-600"
            >
              {selectedShift && isUpdating === selectedShift.id ? 'Updating...' : 'Update & Approve'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}