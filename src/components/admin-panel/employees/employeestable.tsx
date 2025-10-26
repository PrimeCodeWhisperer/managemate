'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EmployeeInfoDialog } from './employee-info-dialog'
import { fetchEmployees, fetchPendingEmployees } from '@/utils/api'
import { Employee, PendingEmployee } from '@/lib/definitions'
import { useSupabaseData } from '@/contexts/SupabaseContext'
import { AddEmployeeDialog } from './add-employee-dialog'
import { redirect, useRouter } from 'next/navigation'
import { clearAppCache, clearCacheAndLogout } from '@/utils/localStorage'


export default function ProfilesPage() {
  const { employees } = useSupabaseData()
  const [profiles, setProfiles] = useState<Employee[]>([])
  const [pending, setPending] = useState<PendingEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router=useRouter()

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      try {
        if (employees) {
          setProfiles(employees || [])
        }
        // load pending
        try {
          const p = await fetchPendingEmployees()
          //console.log(p)
          setPending(p)
        } catch (e: any) {
          console.error('Error fetching pending employees', e)
        }
      } catch (error: any) {
        setError('Error fetching profiles: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [employees])
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/employees`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      clearAppCache()
      // Optimistic UI update
      setProfiles(prev => prev.filter(p => p.id !== id))
      // If you fetched pending list again also adjust it:
      setPending(prev => prev.filter(p => p.id !== id))
      // Navigate (if you are already on /employees you can just refresh)
      router.refresh()
      

    } catch (error: any) {
      setError('Error deleting profile: ' + error.message)
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
    <Card className="rounded-lg border-none mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle >Employees list</CardTitle>
        <AddEmployeeDialog onPendingRefresh={(list)=>setPending(list)}/>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-4'>
          <Table >
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody >
            {profiles.map((profile) => {
              return (
                <TableRow key={profile.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8 bg-secondary">
                      <AvatarImage src="#" alt="Avatar" />
                      <AvatarFallback className="bg-transparent">{`${profile.first_name[0]}${profile.last_name[0]}`}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{`${profile.first_name} ${profile.last_name}`}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell className="flex gap-2">
                    <EmployeeInfoDialog employee={profile} />
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(profile.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
                    <div className="h-px w-full bg-border mb-6" />

        {pending.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-2">Pending employees ({pending.length})</h3>
            <Table className="mb-4">
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map(p => (
                  <TableRow key={p.id} className="bg-muted/30">
                    <TableCell>
                      <Avatar className="h-8 w-8 bg-secondary">
                        <AvatarImage src="#" alt="Avatar" />
                        <AvatarFallback className="bg-transparent">{p.username?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{p.username}</TableCell>
                    <TableCell></TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell className="flex gap-2 w-full">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        </div>
        
      </CardContent>

    </Card>
  )
}