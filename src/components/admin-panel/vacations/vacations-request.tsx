'use client'

import { useState, useEffect } from 'react'
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
  const supabase = createClient()
  const { employees } = useSupabaseData()

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
                  <TableCell>{request.employee?.name}</TableCell>
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
                    {request.status === 'pending' && (
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
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        
      </Card>
    </div>
    
  )
}