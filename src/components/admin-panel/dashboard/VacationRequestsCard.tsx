'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plane } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

export default function VacationRequestsCard() {
  const [pending, setPending] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchPending = async () => {
      const { count } = await supabase
        .from('vacations_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      setPending(count ?? 0)
    }

    fetchPending()

    const channel = supabase
      .channel('vacation_requests_count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vacations_requests' },
        fetchPending
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Vacations</CardTitle>
        <Plane className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{pending}</div>
        <p className="text-xs text-muted-foreground">Pending requests</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/vacations">Go to Vacations</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

