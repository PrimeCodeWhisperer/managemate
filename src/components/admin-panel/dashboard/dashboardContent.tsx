'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Calendar from "./cal";
import ShiftsCard from "./shifts-card";
import { Table,TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import OpenShiftsCard from "./OpenShiftsCard";

export default function DashboardContent(){
    const [selectedDate,setSelectedDate]=useState<null|Date>(new Date);
    const handleSelectedDay=(date:Date|null)=>{
        setSelectedDate(date);
    } 
    const upcomingShifts = [
        { id: 1, date: '2023-06-15', time: '09:00 AM - 05:00 PM', role: 'Cashier' },
        { id: 2, date: '2023-06-16', time: '02:00 PM - 10:00 PM', role: 'Floor Manager' },
        { id: 3, date: '2023-06-18', time: '08:00 AM - 04:00 PM', role: 'Barista' },
    ]
    return(
        <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle>Shift Calendar</CardTitle>
                <CardDescription>View and manage your shifts</CardDescription>
              </CardHeader>
              <CardContent className='flex flex-row'>
                <Calendar onSelectDate={handleSelectedDay} selectionMode="day" areShiftsPresent={true}/>
                {(selectedDate&&(
                  <ShiftsCard date={selectedDate}/>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Shifts</CardTitle>
                <CardDescription>Your next 3 scheduled shifts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingShifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>{shift.date}</TableCell>
                        <TableCell>{shift.time}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{shift.role}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <OpenShiftsCard />
          </div>
        </div>
      </main>
    )
}