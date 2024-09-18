'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { addDays, format, parseISO, isSameDay, isWithinInterval, differenceInHours, add } from 'date-fns';
import { Employee, Shift } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ShiftPopover from './ShiftPopover';
import { fetchEmployees, pubblishShifts } from '@/utils/supabaseClient';
import CustomShiftDialog from './CustomShiftDialog';
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const timeSpans = {
  morning: { start: '06:00', end: '11:59' },
  afternoon: { start: '12:00', end: '17:59' },
  evening: { start: '18:00', end: '23:59' },
};

interface Availability {
  week_start: string;
  availability: {
    [key: string]: { start: string; end: string }[];
  };
  employee?: Employee;
}

interface SchedulerProps {
  shifts?: Shift[];
  employees_list?: Employee[];
  weekStart:string;
}

export default function Component(props: SchedulerProps) {
  const [draft_shifts, setDraftShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[] | undefined>(props.employees_list);
  const selectedWeek = parseISO(props.weekStart);
  console.log(selectedWeek)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const days_objs = days.map((day, index) => addDays(selectedWeek, index));
  console.log(days_objs)

  const [isCustomShiftDialogOpen, setIsCustomShiftDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  console.log(props.shifts)
  //function that handles when a change into an already published schedule is made
  //-take new shifts and edited shifts
  //-publish new shifts
  //-update edited shifts
  const handleScheduleUpdate=()=>{

  }
  //handles when a new shift is being added
  const handleAddCustomShift = (date: Date) => {
    setSelectedDate(date);
    setIsCustomShiftDialogOpen(true);
  };

  const handleSaveCustomShift = (shift: { user_id: string; start_time: string; end_time: string }) => {
    if (selectedDate) {
      const newShift: Shift = {
        user_id: shift.user_id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: shift.start_time,
        end_time: shift.end_time,
        status: 'unplanned'
      };
      setDraftShifts(prevShifts => [...prevShifts, newShift]);
    }
  };

  const handleShiftUpdate = (updatedShift: Shift, field: keyof Shift, value: string) => {
    setDraftShifts(prevShifts => 
      prevShifts.map(shift => 
        shift.user_id === updatedShift.user_id && isSameDay(shift.date, updatedShift.date)
          ? { ...shift, [field]: value }
          : shift
      )
    );
  };
  
  const handleShiftDelete = (shiftToDelete: Shift) => {
    setDraftShifts(prevShifts => 
      prevShifts.filter(shift => 
        !(shift.user_id === shiftToDelete.user_id && isSameDay(shift.date, shiftToDelete.date))
      )
    );
  };

  useEffect(() => {
    const fetchAvailabilities = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('availabilities')
        .select('*')
        .eq('week_start', format(selectedWeek, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error fetching availabilities:', error);
      } else {
        const availability_list = data.map((list_item:any) => {
          const employee = employees?.find(employee => employee.user_id === list_item.employee_id);
          console.log(employees)

          return {
            ...list_item,
            employee: employee,
          }
        });
        console.log(availability_list)
        createInitialDraftShifts(availability_list);
      }
    };

    const createInitialDraftShifts = (availabilities: Availability[]) => {
      const shifts_drafts: Shift[] = [];

    availabilities.forEach((avail) => {
        for (const day of days_objs) {
          let day_index;
          if (day.getDay() === 0) {
            day_index = 6;
          } else {
            day_index = day.getDay() - 1;
          }
          if (avail.availability[days[day_index]][0]) {
            const employee_availability = avail.availability[days[day_index]][0];
            if (employee_availability.start && employee_availability.end) {
              const shift: Shift = {
                user_id: avail.employee?.user_id,
                date: format(day, 'yyyy-MM-dd'),
                start_time: employee_availability.start,
                end_time: employee_availability.end,
                status: 'unplanned'
              }
              shifts_drafts.push(shift);
            }
          }
        }
      })
      setDraftShifts(shifts_drafts)
      
    }

    const fetchEmployeesfromdb = async () => {
      const employees = await fetchEmployees();
      setEmployees(employees);
    }

    if (!employees) {
      fetchEmployeesfromdb();
    }
    if(!props.shifts){
      fetchAvailabilities();
    }else{
      setDraftShifts(props.shifts)
    }
  },[]);
  const renderWeekSchedule = () => {
    console.log(draft_shifts)
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-8 gap-px bg-foreground/15">
            <div className="bg-background/75 p-4"></div>
            {days_objs.map((day) => (
              <div key={day.getDay()} className="bg-background/75 p-4 text-center font-semibold lg:flex lg:items-start lg:justify-between">
                <div  >
                  {format(day,'EEE d')}
                </div>
                {!props.shifts&&(
                  <Button size='sm' onClick={()=>{setSelectedDate(day),setIsCustomShiftDialogOpen(true)}}>+</Button>
                )}
              </div>
            ))}
            {Object.entries(timeSpans).map(([span]) => (
              <React.Fragment key={span}>
                <div className="bg-background/80 p-4 font-semibold capitalize">
                  {span}
                </div>
                
                {days_objs.map((day, dayIndex) => {
                  const filteredShifts = draft_shifts?.filter(shift => 
                    isSameDay(shift.date, day) && 
                    isWithinInterval(parseISO(`2000-01-01T${shift.start_time}`), { 
                      start: parseISO(`2000-01-01T${timeSpans[span as keyof typeof timeSpans].start}`), 
                      end: parseISO(`2000-01-01T${timeSpans[span as keyof typeof timeSpans].end}`) 
                    })
                  );

                  return (
                    <div key={`${format(day, 'yyyy-MM-dd')}-${span}`} className="bg-background p-2 min-h-[120px]">
                      {filteredShifts?.map((shift, index) => {
                        const employee = employees?.find(emp => emp.user_id === shift.user_id);
                        console.log(shift)
                        const startTime = parseISO(`2000-01-01T${shift.start_time}`);
                        const endTime = parseISO(`2000-01-01T${shift.end_time}`);
                        const duration = differenceInHours(endTime, startTime);
                        
                        return (
                          <DropdownMenu key={index}>
                            <DropdownMenuTrigger>
                              <div 
                                key={`${shift.user_id}-${dayIndex}-${span}-${index}`} 
                                className="text-sm bg-background/10 border rounded p-2 mb-1  flex flex-col select-none cursor-pointer"
                              >
                                <div className="font-semibold truncate">{employee?.name}</div>
                                <div className="text-xs text-foreground/60  flex justify-between items-center">
                                  <span >{format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}</span>
                                  <span className="bg-green-200 text-gray-800 px-1 rounded">{duration}h</span>
                                </div>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {props.shifts?(
                                <>
                                  <DropdownMenuItem>Info</DropdownMenuItem>
                                  <DropdownMenuItem>Change time</DropdownMenuItem>
                                </>
                              ):(
                                <>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem onClick={()=>handleShiftDelete(shift)}>Delete</DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-4">
      {renderWeekSchedule()}
      <CustomShiftDialog
        isOpen={isCustomShiftDialogOpen}
        onClose={() => setIsCustomShiftDialogOpen(false)}
        onSave={handleSaveCustomShift}
        date={selectedDate || new Date()}
        employees={employees}
      />
        <div className='flex justify-end mt-4'>
          {props.shifts ? (
            <></>
          ):(
            <Button onClick={handleScheduleUpdate}>Publish Schedule</Button>
          )}
        </div>
    </div>
  );
}