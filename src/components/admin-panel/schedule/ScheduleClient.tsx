'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addWeeks, format, startOfWeek } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEmployeeAvailabilityByWeek, fetchShiftInsertion, fetchShifts } from '@/utils/supabaseClient'
import WeekNavigator from './WeekNavigator'
import Scheduler from './Scheduler'
import { Employee, Shift } from '@/lib/definitions'
import { useAvailabilities } from '@/hooks/use-availabilities'

export default function ScheduleClient({
  employees,
}:{
  employees?:Employee[],
}) {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date()
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 })
    return addWeeks(startOfThisWeek, 2) // Start 2 weeks ahead
  })
  const [availabilityCount, setAvailabilityCount] = useState<number | null>(null)
  const [weekPlanned, setWeekPlanned] = useState(false)
  const [shifts, setShifts] = useState<Shift[]>()
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const checkShiftInserted = async () => {
      const shiftInserted = await fetchShiftInsertion(currentWeek)
      setWeekPlanned(shiftInserted)
      console.log(currentWeek)
    }
    checkShiftInserted()
  }, [currentWeek])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      if (weekPlanned) {
        const fetchedShifts = await fetchShifts(currentWeek)
        setShifts(fetchedShifts)
      } else {
        const availability = await fetchEmployeeAvailabilityByWeek(currentWeek)
        setAvailabilityCount(availability)
      }
      setIsLoading(false)
    }
    loadData()
  }, [currentWeek, weekPlanned])


  return (
    <div className='py-6'>
      <Card>
        <CardHeader>
          <CardTitle>Schedule for Week of {format(currentWeek, 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <WeekNavigator currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
          {isLoading ? (
            <p>Loading...</p>
          ) : weekPlanned ? (
            <Scheduler weekStart={currentWeek.toISOString()} shifts={shifts}employees_list={employees} />
          ) : availabilityCount === null ? (
            <p>Loading availability...</p>
          ) : availabilityCount > 0 ? (
            <Scheduler weekStart={currentWeek.toISOString()} employees_list={employees}/>
          ) : (
            <p>No availabilities inserted yet</p>
          )}
        </CardContent>
      </Card>
    </div>
    
  )
}
