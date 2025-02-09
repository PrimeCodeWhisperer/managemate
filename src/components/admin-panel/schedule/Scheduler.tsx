'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { addDays, format, parseISO, isSameDay, isWithinInterval, differenceInHours, add } from 'date-fns';
import { Employee, Shift,UpcomingShift } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchEmployees, pubblishShifts } from '@/utils/supabaseClient';
import CustomShiftDialog from './CustomShiftDialog';
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { redirect, useRouter } from 'next/navigation';
import clsx from 'clsx';
import EditShiftDialog from './EditShiftDialog';
import InfoShiftDialog from './InfoShiftDialog';
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
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const days_objs = days.map((day, index) => addDays(selectedWeek, index));
  const [isCustomShiftDialogOpen, setIsCustomShiftDialogOpen] = useState(false);
  const [isInfoShiftDialogOpen, setIsInfoShiftDialogOpen] = useState(false);
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>();
  const [isDropDownOpen,setIsDropDownOpen]= useState<boolean>(false);

  const router=useRouter()
  //function that handles when a change into an already published schedule is made
  //-take new shifts and edited shifts
  //-publish new shifts
  //-update edited shifts
  const handlePublishSchedule= async ()=>{
    await pubblishShifts(draft_shifts,selectedWeek);
    router.push('/publish-schedule-success');
  }

  const handleSaveCustomShift = (shift: { user_id: string; start_time: string ;open_shift:boolean}) => {
    if (selectedDate) {
      let newShift: Shift;
      if(shift.open_shift==true){
        newShift={
          date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: shift.start_time,
          status:'open'
        }
      }else{
        newShift={
          user_id: shift.user_id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: shift.start_time,
          status:'unplanned'
          }
      }
      setDraftShifts(prevShifts => [...prevShifts, newShift]);
    }
  };
  const handleShiftDelete = (shiftToDelete: Shift) => {
    setDraftShifts(prevShifts => 
      prevShifts.filter(shift => 
        !(shift.user_id === shiftToDelete.user_id && isSameDay(shift.date, shiftToDelete.date))
      )
    );
  };
  // When this item is clicked, close the dropdown and then open the dialog.
  const handleOpenInfoDialog = () => {
    // First close the dropdown.
    setIsDropDownOpen(false);
    // Then open the dialog.
    setIsInfoShiftDialogOpen(true);
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

          return {
            ...list_item,
            employee: employee,
          }
        });
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
                status: 'availability'
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
    }else if(draft_shifts.length==0){
      setDraftShifts(props.shifts)
    }
  },[props.shifts]);
  const renderWeekSchedule = () => {
    console.log(draft_shifts)
    return (
      <Card >
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
                    <div key={`${format(day, 'yyyy-MM-dd')}-${span}`} className="bg-background p-2 min-h-[120px] w-full">
                      {filteredShifts?.sort(function(a,b){return a.start_time.localeCompare(b.start_time)}).map((shift, index) => {
                        const employee = employees?.find(emp => emp.user_id === shift.user_id);
                        const startTime = parseISO(`2000-01-01T${shift.start_time}`);
                        
                        return (
                          <DropdownMenu key={`${shift.user_id}-${dayIndex}-${span}-${index}`} >
                            <DropdownMenuTrigger asChild className='w-full'>
                              <div 
                                key={`${shift.user_id}-${dayIndex}-${span}-${index}`} 
                                className={clsx("text-sm bg-background/10 border rounded p-2 mb-1 flex flex-col select-none cursor-pointer w-full",shift.status==='availability'&&'bg-green-300 border-green-500',shift.status==='open' && 'bg-blue-300 border-blue-500')}
                              >
                                <div className="flex justify-between items-center font-semibold truncate">{employee?.name}</div>
                                <div className="text-xs text-foreground/60  flex justify-between items-center">
                                  <span >{format(startTime, 'h:mm a')}</span>
                                </div>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {props.shifts?(
                                <>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedShift(shift);
                                    // Delay to ensure dropdown closes and cleans up before dialog opens
                                    setTimeout(() => {
                                      setIsInfoShiftDialogOpen(true);
                                    }, 100);
                                  }}>Info</DropdownMenuItem>
                                  <DropdownMenuItem>Change time</DropdownMenuItem>
                                </>
                              ):(
                                <>
                                  <DropdownMenuItem onClick={()=>{setSelectedShift(shift),handleShiftDelete(shift)}}>Edit</DropdownMenuItem>
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
      
      <EditShiftDialog
        isOpen={isEditShiftDialogOpen}
        onClose={()=>setIsEditShiftDialogOpen(false)}
        onSave={handleSaveCustomShift}
        shift={selectedShift}
        employees={employees}
      />
      <CustomShiftDialog
        isOpen={isCustomShiftDialogOpen}
        onClose={() => setIsCustomShiftDialogOpen(false)}
        onSave={handleSaveCustomShift}
        date={selectedDate || new Date()}
        employees={employees}
      />
      <InfoShiftDialog
        isOpen={isInfoShiftDialogOpen}
        onClose={()=>setIsInfoShiftDialogOpen(false)}
        shift={selectedShift}
        employee={employees?.find(emp=>emp.user_id===selectedShift?.user_id)}
      />
      <div className='flex justify-end mt-4'>
          {props.shifts ? (
            <></>
          ):(
            <Button onClick={handlePublishSchedule}>Publish Schedule</Button>
          )}
        </div>
    </div>
  );
}