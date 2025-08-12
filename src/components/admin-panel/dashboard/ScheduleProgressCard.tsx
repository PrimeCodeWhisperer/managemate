'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { fetchShifts, fetchOpenShifts, fetchEmployeeAvailabilityByWeek } from '@/utils/supabaseClient'
import { useSupabaseData } from '@/contexts/SupabaseContext'

export default function ScheduleProgressCard() {
  const { employees } = useSupabaseData()
  const [filledPct, setFilledPct] = useState(0)
  const [availabilityPct, setAvailabilityPct] = useState(0)

  useEffect(() => {
    const load = async () => {
      const now = new Date()
      const [filled, open, avail] = await Promise.all([
        fetchShifts(now).then(res => res?.length ?? 0),
        fetchOpenShifts(now).then(res => res?.length ?? 0),
        fetchEmployeeAvailabilityByWeek(now).then(res => res ?? 0)
      ])
      const totalShifts = filled + open
      const totalEmployees = employees?.length ?? 0
      setFilledPct(totalShifts === 0 ? 0 : (filled / totalShifts) * 100)
      setAvailabilityPct(totalEmployees === 0 ? 0 : (avail / totalEmployees) * 100)
    }
    load()
  }, [employees])

  const weekReady = filledPct === 100 && availabilityPct === 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Shifts Filled</p>
          <div className="h-2 w-full bg-muted rounded">
            <div className="h-2 bg-primary rounded" style={{ width: `${filledPct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{Math.round(filledPct)}%</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Availability Submitted</p>
          <div className="h-2 w-full bg-muted rounded">
            <div className="h-2 bg-primary rounded" style={{ width: `${availabilityPct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{Math.round(availabilityPct)}%</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {weekReady ? 'Week is fully scheduled' : 'Week needs attention'}
        </p>
      </CardContent>
    </Card>
  )
}

