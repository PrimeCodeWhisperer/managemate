'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchPendingEmployees } from '@/utils/api'
import { PendingEmployee } from '@/lib/definitions'
import { useSupabaseData } from '@/contexts/SupabaseContext'

export default function PendingEmployeesCard() {
  const [pending, setPending] = useState<PendingEmployee[]>([])
  const { company } = useSupabaseData()

  useEffect(() => {
    if (!company?.id) return;
    fetchPendingEmployees(company.id)
      .then(res => setPending(res || []))
      .catch(() => setPending([]))
  }, [company])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Employees</CardTitle>
        <CardDescription>Awaiting approval</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pending.length ? (
          <ul className="space-y-2">
            {pending.slice(0, 5).map(emp => (
              <li key={emp.id} className="flex items-center justify-between">
                <span>{emp.username || emp.email}</span>
                <div className="space-x-2">
                  <Button size="sm" asChild>
                    <Link href={`/employees?id=${emp.id}&action=approve`}>Approve</Link>
                  </Button>
                  <Button size="sm" variant="destructive" asChild>
                    <Link href={`/employees?id=${emp.id}&action=reject`}>Reject</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No pending employees.</p>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href="/employees">Go to Employees</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
