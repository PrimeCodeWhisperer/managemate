import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchShiftsForToday } from '@/utils/supabaseClient';

type CalendarProps = {
  onSelectDate: (date: Date | null) => void;
  initialSelectedDate?: Date | null;
  selectionMode: 'week' | 'day';
  /** Indicates if there are any shifts to look for in the current month */
  areShiftsPresent: boolean;
};

const Calendar: React.FC<CalendarProps> = ({
  onSelectDate,
  initialSelectedDate,
  selectionMode,
  areShiftsPresent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialSelectedDate || new Date(),
  );
  const [daysWithShifts, setDaysWithShifts] = useState<Set<number>>(new Set());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();
  const mondayFirstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: mondayFirstDayOfMonth }, (_, i) => i);

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const fetchShiftDays = async () => {
      if (!areShiftsPresent) {
        setDaysWithShifts(new Set());
        return;
      }
      const shiftDays = new Set<number>();
      const daysInThisMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      ).getDate();
      const promises: Promise<void>[] = [];
      for (let day = 1; day <= daysInThisMonth; day++) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day,
        );
        promises.push(
          fetchShiftsForToday(date).then((shifts) => {
            if (shifts && shifts.length > 0) {
              shiftDays.add(day);
            }
          }),
        );
      }
      await Promise.all(promises);
      setDaysWithShifts(shiftDays);
    };
    fetchShiftDays();
  }, [currentDate, areShiftsPresent]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    if (selectionMode === 'week') {
      const startOfWeek = new Date(newSelectedDate);
      startOfWeek.setDate(newSelectedDate.getDate() - newSelectedDate.getDay() + 1);
      setSelectedDate(startOfWeek);
      onSelectDate(startOfWeek);
    } else {
      if (selectedDate && selectedDate.getTime() === newSelectedDate.getTime()) {
        setSelectedDate(null);
        onSelectDate(null);
      } else {
        setSelectedDate(newSelectedDate);
        onSelectDate(newSelectedDate);
      }
    }
  };
  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;

    if (selectionMode === 'week') {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      return currentDay >= startOfWeek && currentDay <= endOfWeek;
    } else {
      return (
        selectedDate.getFullYear() === currentDate.getFullYear() &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getDate() === day
      );
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getDate() === day
    );
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
      <div className="p-4 grow">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((day) => (
            <div key={day} className="text-center font-medium text-gray-500">
              {day}
            </div>
          ))}
          {emptyDays.map((day) => (
            <div key={`empty-${day}`} />
          ))}
          {days.map((day) => {
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day,
            );
            const formattedDate = date.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const hasShift = daysWithShifts.has(day);

            return (
              <Button
                key={day}
                variant="ghost"
                aria-label={`${formattedDate}${hasShift ? ' - shifts scheduled' : ''}`}
                title={hasShift ? 'Shifts scheduled' : undefined}
                className={cn(
                  'w-full aspect-square p-0 relative',
                  isDateSelected(day)
                    ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                    : isToday(day)
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground'
                    : hasShift
                    ? 'font-bold'
                    : '',
                )}
                onClick={() => handleSelectDate(day)}
              >
                {day}
                {hasShift && (
                  <>
                    <Dot className="h-2 w-2 absolute top-1 right-1" aria-hidden="true" />
                    <span className="sr-only" aria-live="polite">
                      Shifts scheduled
                    </span>
                  </>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

