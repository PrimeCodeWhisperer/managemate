'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { addDays, format, parseISO, isSameDay, isWithinInterval } from 'date-fns';
import { Availability, Shift, WeekCapacity } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { pubblishShifts } from '@/utils/supabaseClient';
import CustomShiftDialog from './CustomShiftDialog';
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import EditShiftDialog from './EditShiftDialog';
import InfoShiftDialog from './InfoShiftDialog';
import { useSupabaseData } from '@/contexts/SupabaseContext';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { mapAvailabilitiesToCandidates, ScheduleSolution } from '@/utils/scheduling/autoScheduler';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_DAY_CAP = 3;
const DEFAULT_SPAN_CAP = 2;

interface SchedulerProps {
  shifts?: Shift[];
  weekStart:string;
  weekCapacity?: WeekCapacity;
}

export default function Component(props: SchedulerProps) {
  const [draft_shifts, setDraftShifts] = useState<Shift[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);
  const [isLoadingAvailabilities, setIsLoadingAvailabilities] = useState(false);
  const { employees } = useSupabaseData();
  const { timeSpans } = useSettings();
  const selectedWeek = useMemo(() => parseISO(props.weekStart), [props.weekStart]);
  const days_objs = useMemo(
    () => WEEK_DAYS.map((_, index) => addDays(selectedWeek, index)),
    [selectedWeek],
  );
  const [isCustomShiftDialogOpen, setIsCustomShiftDialogOpen] = useState(false);
  const [isInfoShiftDialogOpen, setIsInfoShiftDialogOpen] = useState(false);
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>();
  const effectiveWeekCapacity = useMemo<WeekCapacity>(() => {
    const perDay: Record<string, number> = {};
    const perSpan: Record<string, Record<number, number>> = {};

    WEEK_DAYS.forEach((_, index) => {
      const day = addDays(selectedWeek, index);
      const dateKey = format(day, 'yyyy-MM-dd');
      const providedDayCap =
        props.weekCapacity?.perDay?.[dateKey] ?? props.weekCapacity?.perDay?.['*'];
      perDay[dateKey] = providedDayCap ?? DEFAULT_DAY_CAP;

      const spanCapacities: Record<number, number> = {};
      timeSpans.forEach((span) => {
        const providedSpanCap =
          props.weekCapacity?.perSpan?.[dateKey]?.[span.id] ??
          props.weekCapacity?.perSpan?.['*']?.[span.id];
        spanCapacities[span.id] = providedSpanCap ?? DEFAULT_SPAN_CAP;
      });
      perSpan[dateKey] = spanCapacities;
    });

    return { perDay, perSpan };
  }, [props.weekCapacity, selectedWeek, timeSpans]);

  const router=useRouter()
  //function that handles when a change into an already published schedule is made
  //-take new shifts and edited shifts
  //-publish new shifts
  //-update edited shifts
  const handlePublishSchedule= async ()=>{
    await pubblishShifts(draft_shifts,selectedWeek);
    router.push('/publish-schedule-success');
  }

  const handleSaveCustomShift = (shift: { user_id: string; start_time: string; end_time?: string | null; open_shift: boolean }) => {
    const baseDate = selectedDate ?? (selectedShift ? new Date(selectedShift.date) : null);

    if (!baseDate) {
      return;
    }

    if (shift.end_time && shift.end_time <= shift.start_time) {
      toast("End time must be after start time");
      return;
    }

    const newShift: Shift = {
      date: format(baseDate, 'yyyy-MM-dd'),
      start_time: shift.start_time,
      status: shift.open_shift ? 'open' : 'unplanned',
    };

    if (!shift.open_shift) {
      newShift.user_id = shift.user_id;
    }

    if (shift.end_time) {
      newShift.end_time = shift.end_time;
    }

    if (
      timeSpans.length &&
      (newShift.start_time < timeSpans[0].start_time ||
        (newShift.end_time ? newShift.end_time > timeSpans[timeSpans.length - 1].end_time : false))
    ) {
      toast("Shift out of timespan");
    } else {
      setDraftShifts((shifts) => [...shifts, newShift]);
    }
  };
  const handleShiftDelete = (shiftToDelete: Shift) => {
    setDraftShifts(prevShifts =>
      prevShifts.filter(shift =>
        !(
          shift.user_id === shiftToDelete.user_id &&
          shift.start_time == shiftToDelete.start_time &&
          shift.end_time === shiftToDelete.end_time &&
          isSameDay(shift.date, shiftToDelete.date)
        )
      )
    );
  };
  // When this item is clicked, close the dropdown and then open the dialog.
  const buildAvailabilityPlaceholders = useCallback((records: Availability[]): Shift[] => {
    const placeholders: Shift[] = [];

    records.forEach((availabilityItem) => {
      days_objs.forEach((day) => {
        const isoDay = day.getDay();
        const dayIndex = isoDay === 0 ? 6 : isoDay - 1;
        const dayLabel = WEEK_DAYS[dayIndex];
        const availabilitySlots = availabilityItem.availability?.[dayLabel];

        if (!availabilitySlots || !availabilitySlots.length) {
          return;
        }

        const slot = availabilitySlots[0];
        if (!slot?.start) {
          return;
        }

        const shift: Shift = {
          user_id: availabilityItem.employee?.id,
          date: format(day, 'yyyy-MM-dd'),
          start_time: slot.start,
          status: 'availability',
        };

        if (slot.end) {
          shift.end_time = slot.end;
        }

        placeholders.push(shift);
      });
    });

    return placeholders;
  }, [days_objs]);

  const handleAutoSchedule = async () => {
    if (props.shifts || isAutoScheduling) {
      return;
    }

    if (!employees || employees.length === 0 || !timeSpans.length) {
      toast.error('Employees or time spans are not available.');
      setAutoError('Employees or time spans are not available.');
      return;
    }

    if (!availabilities.length) {
      toast.error('No availability data loaded for this week.');
      setAutoError('No availability data loaded for this week.');
      return;
    }

    const hasManualEntries = draft_shifts.some(
      (shift) => shift.status && shift.status !== 'availability',
    );
    if (hasManualEntries) {
      const confirmed = window.confirm(
        'Auto scheduling will replace existing shifts for this week. Continue?',
      );
      if (!confirmed) {
        return;
      }
    }

    setIsAutoScheduling(true);
    setAutoError(null);

    try {
      console.log('Auto scheduling started', {
        weekStart: format(selectedWeek, 'yyyy-MM-dd'),
      });

      const candidates = mapAvailabilitiesToCandidates(availabilities, days_objs, timeSpans);
      if (!candidates.length) {
        toast.error('No candidates matched the current availability and time spans.');
        setAutoError('No candidates matched the current availability and time spans.');
        return;
      }

      const response = await fetch('/api/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidates,
          capacities: effectiveWeekCapacity,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        const message =
          (payload as { error?: string } | null)?.error ?? 'Auto scheduling failed.';
        throw new Error(message);
      }

      const solution = payload as ScheduleSolution;

      const assignments = solution.assignments.map((assignment) => ({
        ...assignment,
        status: 'auto-assigned',
      }));

      const openShifts: Shift[] = [];
      solution.unfilled.forEach(({ day, spanId, remaining, gaps }) => {
        const span = timeSpans.find((item) => item.id === spanId);
        if (!span) {
          return;
        }
        if (gaps?.length) {
          gaps.forEach((gap) => {
            if (gap.start_time === gap.end_time) {
              return;
            }
            openShifts.push({
              date: day,
              start_time: gap.start_time,
              end_time: gap.end_time,
              status: 'open',
            });
          });
        }

        for (let count = 0; count < remaining; count += 1) {
          openShifts.push({
            date: day,
            start_time: span.start_time,
            end_time: span.end_time,
            status: 'open',
          });
        }
      });

      console.log('Auto scheduling completed', solution);

      setDraftShifts([...assignments, ...openShifts]);
      toast.success('Auto schedule generated.');
    } catch (error) {
      console.error('Auto scheduling failed', error);
      const message =
        error instanceof Error ? error.message : 'Unable to auto schedule this week.';
      setAutoError(message);
      toast.error(message);
    } finally {
      setIsAutoScheduling(false);
    }
  };

  useEffect(() => {
    if (!employees) {
      return;
    }

    if (props.shifts) {
      setAvailabilities([]);
      setDraftShifts(props.shifts);
      setIsLoadingAvailabilities(false);
      return;
    }

    let isMounted = true;

    const fetchAvailabilities = async () => {
      setIsLoadingAvailabilities(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('availabilities')
          .select('*')
          .eq('week_start', format(selectedWeek, 'yyyy-MM-dd'));

        if (!isMounted) {
          return;
        }

        if (error) {
          console.error('Error fetching availabilities:', error);
          setAvailabilities([]);
          setDraftShifts([]);
          setAutoError('Unable to load availability data.');
          toast.error('Unable to load availability data.');
        } else {
          const availabilityList: Availability[] = data.map((item: any) => {
            const employee = employees?.find((emp) => emp.id === item.employee_id);
            return {
              ...item,
              employee,
            };
          });

          setAvailabilities(availabilityList);
          const placeholders = buildAvailabilityPlaceholders(availabilityList);
          setDraftShifts(placeholders);
          setAutoError(null);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error('Unexpected error fetching availabilities:', err);
        setAutoError('Unexpected error loading availability data.');
        toast.error('Unexpected error loading availability data.');
        setAvailabilities([]);
        setDraftShifts([]);
      } finally {
        if (isMounted) {
          setIsLoadingAvailabilities(false);
        }
      }
    };

    fetchAvailabilities();

    return () => {
      isMounted = false;
    };
  }, [employees, props.shifts, props.weekStart, selectedWeek, buildAvailabilityPlaceholders]);
  const renderWeekSchedule = () => {
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
            {timeSpans.map((span) => (
              <React.Fragment key={span.id}>
                <div className="bg-background/80 p-4 font-semibold capitalize">
                  {span.name}
                </div>

                {days_objs.map((day, dayIndex) => {
                  const filteredShifts = draft_shifts?.filter(shift =>
                    isSameDay(shift.date, day) &&
                    isWithinInterval(parseISO(`2000-01-01T${shift.start_time}`), {
                      start: parseISO(`2000-01-01T${span.start_time}`),
                      end: parseISO(`2000-01-01T${span.end_time}`)
                    })
                  );
                  return (
                    <div key={`${format(day, 'yyyy-MM-dd')}-${span.id}`} className="bg-background p-2 min-h-[120px] w-full">
                      {filteredShifts?.sort(function(a,b){return a.start_time.localeCompare(b.start_time)}).map((shift, index) => {
                        const employee = employees?.find(emp => emp.id === shift.user_id);
                        const startTime = parseISO(`2000-01-01T${shift.start_time}`);
                        const endTime = shift.end_time ? parseISO(`2000-01-01T${shift.end_time}`) : undefined;
                        const label =
                          shift.status === 'open'
                            ? 'Open shift'
                            : employee?.username ?? 'Unassigned';
                        return (
                          <DropdownMenu key={`${shift.user_id}-${dayIndex}-${span.id}-${index}`} >
                            <DropdownMenuTrigger asChild className='w-full'>
                              <div
                                key={`${shift.user_id}-${dayIndex}-${span.id}-${index}`}
                                className={clsx(
                                  'text-sm bg-background/10 border rounded p-2 mb-1 flex flex-col select-none cursor-pointer w-full',
                                  shift.status === 'availability' && 'bg-green-300 border-green-500',
                                  shift.status === 'open' && 'bg-blue-300 border-blue-500',
                                  shift.status === 'auto-assigned' && 'bg-sky-200 border-sky-500',
                                )}
                              >
                                <div className="flex justify-between items-center font-semibold truncate">
                                  {label}
                                  {shift.status === 'auto-assigned' && (
                                    <span className="ml-2 text-xs font-normal text-sky-700">Auto</span>
                                  )}
                                </div>
                                <div className="text-xs text-foreground/60  flex justify-between items-center">
                                  <span>
                                    {shift.end_time && endTime
                                      ? `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`
                                      : format(startTime, 'h:mm a')}
                                  </span>
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
                                  <DropdownMenuItem onClick={()=>{
                                    setSelectedShift(shift);
                                    handleShiftDelete(shift)
                                    // Delay to ensure dropdown closes and cleans up before dialog opens
                                    setTimeout(() => {
                                      setIsEditShiftDialogOpen(true);
                                    }, 100);

                                    }}>Edit</DropdownMenuItem>
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

  const autoButtonDisabled =
    isAutoScheduling ||
    isLoadingAvailabilities ||
    !employees?.length ||
    !timeSpans.length ||
    !availabilities.length;
  
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
        employee={employees?.find(emp=>emp.id===selectedShift?.user_id)}
      />
      {!props.shifts && (
        <>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleAutoSchedule}
              disabled={autoButtonDisabled}
            >
              {isAutoScheduling ? 'Auto Scheduling...' : 'Auto Schedule'}
            </Button>
            <Button
              onClick={handlePublishSchedule}
              disabled={isAutoScheduling || isLoadingAvailabilities}
            >
              Publish Schedule
            </Button>
          </div>
          {autoError && (
            <p className="text-sm text-destructive text-right">{autoError}</p>
          )}
        </>
      )}
    </div>
  );
}
