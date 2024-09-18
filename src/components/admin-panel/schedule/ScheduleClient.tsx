'use client'

import { useEffect, useState } from 'react'
import { addWeeks, format, startOfWeek } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEmployeeAvailabilityByWeek, fetchShiftInsertion, fetchShifts } from '@/utils/supabaseClient'
import WeekNavigator from './WeekNavigator'
import Scheduler from './Scheduler'
import { Employee, Shift } from '@/lib/definitions'
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
      {/* month picker hided in order to finish MVP ASAP */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Month selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger>
              <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !currentWeek && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentWeek ? format(currentWeek, "MMM yyyy") : <span>Pick a month</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" >
              <MonthPicker/>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card> */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule for Week of {format(currentWeek, 'MMMM d, yyyy')}</CardTitle>
          <CardDescription>{weekPlanned?`Week currently planned`:`Week currently unplanned`}</CardDescription>
        </CardHeader>
        <CardContent>
          <WeekNavigator currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
          {isLoading ? (
            <p>Loading...</p>
          ) : weekPlanned ? (
            <Scheduler weekStart={currentWeek.toISOString()} shifts={shifts}employees_list={employees} />
          ) : (
            <Scheduler weekStart={currentWeek.toISOString()} employees_list={employees}/>
          ) }
        </CardContent>
      </Card>
    </div>
    
  )
}
