'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar,AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EmployeeInfoDialog } from './employee-info-dialog'
import { fetchEmployees } from '@/utils/api'

interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  username: string
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
        if (error) {
          throw error
        }

        setProfiles(data || [])
      } catch (error: any) {
        setError('Error fetching profiles: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [supabase])
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      const updatedProfiles = profiles.filter(profile => profile.id !== id)
      setProfiles(updatedProfiles)

      const cachedEmployees = localStorage.getItem('employees')
      if (cachedEmployees) {
        const updatedEmployees = await fetchEmployees();
        localStorage.setItem('employees', JSON.stringify(updatedEmployees))
      }
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
        <CardHeader>
            <CardTitle >Employees list</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
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
            {profiles.map((profile) => {
                return(
                <TableRow key={profile.id}>
                <TableCell>
                <Avatar className="h-8 w-8 bg-secondary">
                  <AvatarImage src="#" alt="Avatar" />
                  <AvatarFallback className="bg-transparent">{`${profile.first_name[0]}${profile.last_name[0]}`}</AvatarFallback>
                </Avatar>
                </TableCell>
                <TableCell>{profile.username}</TableCell>
                <TableCell>{`${profile.first_name} ${profile.last_name}`}</TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell className="flex gap-2">
                    <EmployeeInfoDialog employee={profile}/>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(profile.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </TableCell>
                </TableRow>
                );
            })}
            </TableBody>
        </Table>
        </CardContent>
      
    </Card>
  )
}