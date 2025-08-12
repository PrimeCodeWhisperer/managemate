'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { User, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabaseData } from '@/contexts/SupabaseContext'
import { fetchPendingEmployees } from '@/utils/api'
import { fetchOpenShifts } from '@/utils/supabaseClient'
import { createClient } from '@/utils/supabase/client'
import OpenShiftsCard from "./OpenShiftsCard";
import PendingEmployeesCard from "./PendingEmployeesCard";
import VacationRequestsCard from "./VacationRequestsCard";
import ScheduleProgressCard from "./ScheduleProgressCard";


const supabase = createClient()

export default function DashboardContent() {
  const { employees } = useSupabaseData()
  const [pendingEmployees, setPendingEmployees] = useState(0)
  const [openShifts, setOpenShifts] = useState(0)

  const refreshCounts = useCallback(async () => {
    try {
      const [pending, open] = await Promise.all([
        fetchPendingEmployees().then(res => res?.length || 0).catch(() => 0),
        fetchOpenShifts(new Date()).then(res => res?.length || 0).catch(() => 0),
      ])
      setPendingEmployees(pending)
      setOpenShifts(open)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    }
  }, [])

  useEffect(() => {
    refreshCounts()
    const channel = supabase
      .channel('dashboard_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_employees' }, refreshCounts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'open_shifts' }, refreshCounts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, refreshCounts)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshCounts])

  const totalEmployees = employees?.length || 0

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">{pendingEmployees} pending approval</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/employees">Go to Employees</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schedule</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openShifts}</div>
              <p className="text-xs text-muted-foreground">Open shifts this week</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/schedule">Go to Schedule</Link>
              </Button>
            </CardContent>
          </Card>

          <ScheduleProgressCard />
          <VacationRequestsCard />
          <OpenShiftsCard />
          <PendingEmployeesCard />
        </div>
      </div>
    </main>
  )
}

