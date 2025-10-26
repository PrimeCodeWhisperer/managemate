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
import { fetchPastShifts } from '@/utils/supabaseClient'
import { Shift } from '@/lib/definitions'
import WeekNavigator from '../WeekNavigator'
import { toast } from 'sonner'

interface PastShift extends Shift {
  end_time: string;
  user_id: string;
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
    try {
      // TODO: Implement API call to update shift status to 'approved'
      // await updateShiftStatus(shift.id, 'approved')
      
      // Update local state
      setPastShifts(prev => 
        prev.map(s => s.id === shift.id ? { ...s, status: 'approved' } : s)
      )
      toast.success('Shift approved successfully')
    } catch (error) {
      console.error('Error approving shift:', error)
      toast.error('Failed to approve shift')
    }
  }

  const handleReject = async (shift: PastShift) => {
    try {
      // TODO: Implement API call to update shift status to 'rejected'
      // await updateShiftStatus(shift.id, 'rejected')
      
      // Update local state
      setPastShifts(prev => 
        prev.map(s => s.id === shift.id ? { ...s, status: 'rejected' } : s)
      )
      toast.success('Shift rejected')
    } catch (error) {
      console.error('Error rejecting shift:', error)
      toast.error('Failed to reject shift')
    }
  }

  const handleModifyTimeOpen = (shift: PastShift) => {
    setSelectedShift(shift)
    setModifiedStartTime(shift.start_time)
    setModifiedEndTime(shift.end_time)
    setModifyDialogOpen(true)
  }

  const handleModifyTimeSubmit = async () => {
    if (!selectedShift) return

    try {
      // TODO: Implement API call to update shift times and approve
      // await updateShiftTimes(selectedShift.id, modifiedStartTime, modifiedEndTime, 'approved')
      
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
                    <TableHead>Employee ID</TableHead>
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

                    return (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">
                          {formatDate(shift.date)}
                        </TableCell>
                        <TableCell>{shift.user_id}</TableCell>
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
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleModifyTimeOpen(shift)}
                                >
                                  Modify & Approve
                                </Button>
                              </>
                            )}
                            {shift.status !== 'rejected' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(shift)}
                              >
                                Reject
                              </Button>
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
            <Button onClick={handleModifyTimeSubmit} className="bg-green-500 hover:bg-green-600">
              Update & Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}