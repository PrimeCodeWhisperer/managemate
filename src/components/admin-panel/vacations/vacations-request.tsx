'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Check, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { Employee } from '@/lib/definitions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabaseData } from '@/contexts/SupabaseContext'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface VacationRequest {
  id: string
  employee_id: string
  employee?: Employee
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function VacationRequestsPage() {
  const [requests, setRequests] = useState<VacationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRequest, setEditingRequest] = useState<VacationRequest | null>(null)
  const [editForm, setEditForm] = useState<{ start_date: string; end_date: string; status: VacationRequest['status'] }>({
    start_date: '',
    end_date: '',
    status: 'approved',
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const supabase = createClient()
  const { employees } = useSupabaseData()

  const toDateInputValue = (date: string) => {
    if (!date) return ''
    const [day] = date.split('T')
    return day || date.slice(0, 10)
  }

  useEffect(() => {
    const fetchVacationRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('vacations_requests')
          .select(`
            id,
            employee_id,
            start_date,
            end_date,
            status
          `)
          .order('start_date', { ascending: true })

        if (error) {
          throw error
        }
        setRequests(
          data?.map(item => ({
            ...item,
            employee: employees?.find(e => e.id === item.employee_id),
          })) || []
        )
      } catch (error: any) {
        setError('Error fetching vacation requests: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    if (employees) {
      fetchVacationRequests()
    }
  }, [employees, supabase])

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      setError(null)
      const { error } = await supabase
        .from('vacations_requests')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) {
        throw error
      }

      setRequests(requests.map(request => 
        request.id === id ? { ...request, status: newStatus } : request
      ))
    } catch (error: any) {
      setError('Error updating request status: ' + error.message)
    }
  }

  const handleModifyClick = (request: VacationRequest) => {
    setError(null)
    setEditForm({
      start_date: toDateInputValue(request.start_date),
      end_date: toDateInputValue(request.end_date),
      status: request.status,
    })
    setEditingRequest(request)
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingRequest) {
      return
    }
    setSavingEdit(true)
    setError(null)

    try {
      const updates = {
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        status: editForm.status,
      }

      const { error } = await supabase
        .from('vacations_requests')
        .update(updates)
        .eq('id', editingRequest.id)

      if (error) {
        throw error
      }

      setRequests(prev =>
        prev.map(request =>
          request.id === editingRequest.id ? { ...request, ...updates } : request
        )
      )

      setEditingRequest(null)
    } catch (error: any) {
      setError('Error updating vacation request: ' + error.message)
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditingRequest(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='py-6'>
      <Card >
        <CardHeader>
          <CardTitle>Vacation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.employee?.username}</TableCell>
                  <TableCell>{format(new Date(request.start_date), 'PP')}</TableCell>
                  <TableCell>{format(new Date(request.end_date), 'PP')}</TableCell>
                  <TableCell>
                    <Badge variant={
                      request.status === 'approved' ? 'default' :
                      request.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'approved')}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModifyClick(request)}
                      >
                        Modify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

      </Card>
      <Dialog open={!!editingRequest} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Vacation Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={editForm.start_date}
                onChange={(event) =>
                  setEditForm(prev => ({ ...prev, start_date: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={editForm.end_date}
                onChange={(event) =>
                  setEditForm(prev => ({ ...prev, end_date: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm(prev => ({ ...prev, status: value as VacationRequest['status'] }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRequest(null)}
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    
  )
}
