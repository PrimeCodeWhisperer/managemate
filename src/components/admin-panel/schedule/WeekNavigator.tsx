import React from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Calendar from '../dashboard/cal'

interface WeekNavigatorProps {
  currentWeek: Date
  setCurrentWeek: React.Dispatch<React.SetStateAction<Date>>
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({ currentWeek, setCurrentWeek }) => {
  const formatWeek = (date: Date): string => {
    const startOfThisWeek = startOfWeek(date, { weekStartsOn: 1 })
    const endOfThisWeek = endOfWeek(date, { weekStartsOn: 1 })
    return `${format(startOfThisWeek, 'MMM dd')} - ${format(endOfThisWeek, 'MMM dd')}`
  }

  const prevWeek = (): void => {
    setCurrentWeek((prev) => addWeeks(prev, -1))
  }

  const nextWeek = (): void => {
    setCurrentWeek((prev) => addWeeks(prev, 1))
  }

  return (
    <div className="flex items-center justify-center space-x-4 py-3">
      <Button variant="outline" size="icon" onClick={prevWeek}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger>
          <span className="text-lg font-medium cursor-pointer">{formatWeek(currentWeek)}</span>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            onSelectDate={()=>{}}
            selectionMode='week'
            />
        </PopoverContent>
      </Popover>
      <Button variant="outline" size="icon" onClick={nextWeek}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default WeekNavigator