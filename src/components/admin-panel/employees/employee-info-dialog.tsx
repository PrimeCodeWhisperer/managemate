"use client"

import { CalendarDays } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Employee, Shift } from "@/lib/definitions"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { format, startOfDay } from "date-fns"


export function EmployeeInfoDialog({ employee }: { employee: Employee }) {
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
                //console.log('Error fetching profiles: ' + error.message)
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
                        <AvatarImage alt={`${employee.first_name} ${employee.last_name}`} />
                        <AvatarFallback>{employee.first_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
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

