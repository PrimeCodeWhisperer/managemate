'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { parseISO, format } from 'date-fns'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchOpenShifts } from '@/utils/supabaseClient'
import { Shift } from '@/lib/definitions'

export default function OpenShiftsCard() {
  const [openShifts, setOpenShifts] = useState<Shift[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await fetchOpenShifts(new Date())
      setOpenShifts(data ?? [])
    }
    load()
  }, [])

  const grouped = openShifts.reduce<Record<string, Shift[]>>((acc, shift) => {
    const date = shift.date
    if (!acc[date]) acc[date] = []
    acc[date].push(shift)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Shifts</CardTitle>
        <CardDescription>Unassigned shifts this week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedDates.length ? (
          sortedDates.map((date) => (
            <div key={date} className="space-y-2">
              <p className="text-sm font-medium">{format(parseISO(date), 'EEEE, MMM d')}</p>
              <ul className="space-y-2">
                {grouped[date].map((shift) => (
                  <li key={shift.id} className="flex items-center justify-between">
                    <span>{shift.start_time}</span>
                    <Button asChild size="sm">
                      <Link href={`/schedule?date=${date}&time=${shift.start_time}`}>Assign</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No open shifts.</p>
        )}
      </CardContent>
    </Card>
  )
}

