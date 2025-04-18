"use client"

import { CalendarDays } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Employee, Shift } from "@/lib/definitions"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { format, startOfDay } from "date-fns"

interface Profile {
    id: string
    email: string
    first_name: string
    last_name: string
    username: string
  }
const employeeInfo = {
    name: "Sarah J.",
    role: "Waiter",
    avatar: "/placeholder.svg?height=80&width=80",
    upcomingShifts: [
        { date: "Mon, May 15", time: "2PM - 10PM" },
        { date: "Wed, May 17", time: "11AM - 7PM" },
        { date: "Fri, May 19", time: "4PM - 12AM" },
    ],
}

export function EmployeeInfoDialog({ employee }: { employee: Profile }) {
    const [shifts,setShifts]=useState<Shift[]>([]);
    useEffect(()=>{
        const fetchUpcomingShifts = async ()=>{
            const supabase = createClient()
            const startOfToday = startOfDay(Date.now());
            const date_string=format(startOfToday,'yyyy-MM-dd')
            try {
                const { data, error } = await supabase
                  .from('upcoming_shifts')
                  .select('*')
                  .eq('user_id',employee.id)
                  .gt('date',date_string)
                if (error) {
                  throw error
                }
        
                setShifts(data || [])
              } catch (error: any) {
                console.log('Error fetching profiles: ' + error.message)
              }
        }
        fetchUpcomingShifts();
    })
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default"size="sm">View</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Employee Schedule</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-4 py-4">
                    <Avatar>
                        <AvatarImage alt={employee.username} />
                        <AvatarFallback>{employee.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{employee.username}</h3>
                        <p className="text-sm text-muted-foreground">Waiter</p>
                    </div>
                </div>
                <div>
                    <h4 className="mb-2 font-medium">Upcoming Shifts</h4>
                    <ul className="space-y-2">
                        {shifts.map((shift, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4" />
                                <span>{shift.date}:</span>
                                <span className="font-medium">{shift.start_time}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    )
}

