'use client'

import { useEffect, useState } from 'react';
import { fetchEmployees } from '@/utils/supabaseClient';
import Scheduler from '@/components/admin-panel/schedule/Scheduler';
import WeekNavigator from '@/components/admin-panel/schedule/WeekNavigator';
import { Employee, Shift } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';

export default function OpenShiftsPage() {
  const [employees, setEmployees] = useState<Employee[]|undefined>([]);
  const [shifts, setShifts] = useState<Shift[]|undefined>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    const loadEmployees = async () => {
      const fetchedEmployees = await fetchEmployees();
      setEmployees(fetchedEmployees);
      setIsLoading(false);
    };

    loadEmployees();
  }, []);

  return (
    <div className="py-6">
      <Card>
        <CardHeader>
          <CardTitle>Open Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <WeekNavigator currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
          {isLoading ? (
            <p>Loading employees...</p>
          ) : (
            <Scheduler weekStart={currentWeek.toISOString()} shifts={shifts} employees_list={employees} />
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Employee Shift Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="border-b">Employee Name</TableHead>
                <TableHead className="border-b">Requested Shift</TableHead>
                <TableHead className="border-b">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Replace with actual data */}
              <TableRow>
                <TableCell className="border-b">John Doe</TableCell>
                <TableCell className="border-b">Monday, 9 AM - 5 PM</TableCell>
                <TableCell className="border-b">Pending</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border-b">Jane Smith</TableCell>
                <TableCell className="border-b">Tuesday, 10 AM - 6 PM</TableCell>
                <TableCell className="border-b">Approved</TableCell>
              </TableRow>
              {/* Add more rows as needed */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}