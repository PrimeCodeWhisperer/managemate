'use client'

import { useEffect, useState } from 'react'
import { addWeeks, differenceInCalendarWeeks, format, startOfWeek } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchOpenShifts, fetchShiftInsertion, fetchShifts } from '@/utils/supabaseClient'
import Scheduler from './Scheduler'
import { Shift } from '@/lib/definitions'
import WeekNavigator from '../WeekNavigator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
export default function ScheduleClient() {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date()
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 })
    return addWeeks(startOfThisWeek, 2) // Start 2 weeks ahead
  })
  const [weekPlanned, setWeekPlanned] = useState(false)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toggleAvailabilities,setToggleAvailabilities] = useState(false)
  const [weekDifference,setWeekDifference] = useState(2)
  useEffect(() => {
    const checkShiftInserted = async () => {
      const shiftInserted = await fetchShiftInsertion(currentWeek)
      setWeekPlanned(shiftInserted)
      const todaysWeek=startOfWeek(new Date(),{weekStartsOn:1})
      const weekDifference=differenceInCalendarWeeks(currentWeek,todaysWeek,{weekStartsOn:1})
      setWeekDifference(weekDifference)
      if (shiftInserted) setToggleAvailabilities(false)
      else setToggleAvailabilities(true)
    }
    checkShiftInserted()
  }, [currentWeek])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      if (weekPlanned) {
        const fetchedShifts = await fetchShifts(currentWeek)
        const fetchedOpenShifts = await fetchOpenShifts(currentWeek)
        const shifts = fetchedShifts ? fetchedShifts : []
        const open = fetchedOpenShifts ? fetchedOpenShifts : []

        open.forEach(shift => shift.status = 'open')
        const all = shifts.concat(open)
        setShifts(all)
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
          <CardTitle>Schedule for Week {format(currentWeek, 'w (y)')}</CardTitle>
          <CardDescription>{weekPlanned ? `Week currently planned` : `Week currently unplanned`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center w-full">
            <div className="flex-1"></div>

            <div className="flex-none">
              <WeekNavigator currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
            </div>

            <div className="flex-1 flex justify-end items-center gap-2">
              <Switch id="availabilty_toggle" disabled={weekDifference<0} onCheckedChange={()=>setToggleAvailabilities(!toggleAvailabilities)} checked={toggleAvailabilities}/>
              <Label htmlFor="availabilty_toggle">Toggle availabilities</Label>
            </div>
          </div>
          {isLoading ? (
            <p>Loading...</p>
          ) : weekPlanned ? (
            <Scheduler weekStart={currentWeek.toISOString()} shifts={shifts} toggleAvailabilities={toggleAvailabilities} />
          ) : (
            <Scheduler weekStart={currentWeek.toISOString()} toggleAvailabilities={toggleAvailabilities}/>
          )}
        </CardContent>
      </Card>
    </div>

  )
}
