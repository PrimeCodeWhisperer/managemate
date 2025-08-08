'use client'
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetchShiftsForToday } from "@/utils/supabaseClient"
import { Shift } from "@/lib/definitions"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"


export default function UpcomingShiftsCard() {
  const [shiftsForSelectedDate, setShiftsForSelectedDate] = useState<Shift[] | undefined>([]);
  const date = new Date();
  useEffect(() => {
    const fetchData = async () => {
      const shiftsForSelectedDate = await fetchShiftsForToday(date);
      setShiftsForSelectedDate(shiftsForSelectedDate);
    };
    fetchData();
  }, [date]);
  return (
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
            {shiftsForSelectedDate?.map((shift) => (
                <TableRow key={shift.id}>
                <TableCell>{shift.date}</TableCell>
                <TableCell>{`${shift.start_time}`}</TableCell>
                <TableCell>
                    <Badge variant="outline">{'Waiter'}</Badge>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </CardContent>
    </Card>
  )
}