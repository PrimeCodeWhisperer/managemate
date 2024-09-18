'use client'
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetchShiftsForToday, fetchEmployees } from "@/utils/supabaseClient"
import { Shift } from "@/lib/definitions"
import { Employee } from "@/lib/definitions"
import { useEffect, useState } from "react"
interface ShiftScheduleCardProps {
  date: Date
}

export default function ShiftsCard({ date }: ShiftScheduleCardProps) {
  const [shiftsForSelectedDate,setShiftsForSelectedDate]=useState<Shift[]|undefined>([]);    
  const [employees,setEmployees]=useState<Employee[]|undefined>([]);    

  useEffect(()=>{
    const fetchData=async ()=>{
      const shiftsForSelectedDate = await fetchShiftsForToday(date);
      const employees=await fetchEmployees();    
      setShiftsForSelectedDate(shiftsForSelectedDate);
      setEmployees(employees);
    }
    fetchData();
    console.log(shiftsForSelectedDate)
  },[date])
  return (
    <Card className=" max-w-md mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Shifts for {format(date, "MMMM d, yyyy")}</h2>
        {shiftsForSelectedDate?.length ? (
          <ul className="space-y-4">
            {shiftsForSelectedDate.map((shift:Shift) => {
              const employee=employees?.find(e=>e.user_id===shift.user_id)
              return(
              <li key={shift.id} className="flex items-center space-x-4 bg-secondary p-3 rounded-md">
                <Avatar>
                  <AvatarFallback>{}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{employee?.name}</p>
                  <p className="text-sm text-muted-foreground">{'Waiter'}</p>
                  <p className="text-sm text-muted-foreground">
                    {shift.start_time} - {shift.end_time}
                  </p>
                </div>
              </li>
            )})}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">No shifts scheduled for this date.</p>
        )}
      </CardContent>
    </Card>
  )
}