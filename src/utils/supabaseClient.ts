import { createClient } from './supabase/client';
import { endOfWeek, startOfWeek, format, startOfDay, endOfDay } from 'date-fns';
import { Shift, UpcomingShift } from '@/lib/definitions';
import { DailyTimesheet, MonthTimesheetSummary } from '@/types/timesheet';

export async function updateSelectedShifts(updated_shifts:Shift[]){
  

}
export async function pubblishShifts(draft_shifts:Shift[],weekStart:Date){
  const supabase = createClient();

  try {
    const openShifts=draft_shifts.filter(shift=>shift.status==='open');
    const assignedShifts=draft_shifts.filter(shift=>shift.status!=='open' && shift.status!=='availability');

    const open_db=openShifts.map((d) => ({
      date: format(d.date, 'yyyy-MM-dd'), // Convert Date to YYYY-MM-DD string
      start_time: d.start_time,
    }))

    const assigned_db=assignedShifts.map((d) => ({
      user_id: d.user_id,
      date: format(d.date, 'yyyy-MM-dd'), // Convert Date to YYYY-MM-DD string
      start_time: d.start_time,
    }))
    await supabase.from('upcoming_shifts').insert(assigned_db)
   
    const { data, error } =await supabase.from('open_shifts').insert(open_db)
    await supabase.from('week_shifts').insert({week_start:format(weekStart,'yyyy-MM-dd')})

    if (error) {
      console.error('Error while inserting shifts:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Unexpected error while inserting shifts:', error)
    throw error
  }
}

// Update shift status (for approval/rejection)
export async function updateShiftStatus(shiftId: number, status: 'approved' | 'rejected'): Promise<boolean> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('past_shifts')
      .update({ approved:true })
      .eq('id', shiftId)
      .select();

    if (error) {
      console.error('Error updating shift status:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating shift status:', error);
    throw error;
  }
}

// Update shift times and status (for modify and approve)
export async function updateShiftTimes(
  shiftId: number, 
  startTime: string, 
  endTime: string, 
  status: 'approved' = 'approved'
): Promise<boolean> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('past_shifts')
      .update({ 
        start_time: startTime,
        end_time: endTime,
        approved:true, 
      })
      .eq('id', shiftId)
      .select();

    if (error) {
      console.error('Error updating shift times:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating shift times:', error);
    throw error;
  }
}

export async function fetchShiftInsertion(currentWeek:Date){
  const supabase = createClient();

  const startOfThisWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const {data, error}= await supabase
    .from('week_shifts')
    .select('*')
    .gte('week_start', startOfThisWeek.toISOString())
    .lte('week_start', endOfThisWeek.toISOString());
  if(error){
    console.error('Error fetching shifts planning:', error);
    return false;
  }else{
    const ret_val=data.length?true:false;
    return ret_val;
  }
}
export async function fetchShifts(currentWeek: Date): Promise<Shift[] | undefined> {
  const supabase = createClient();

  const startOfThisWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const startWeekString = format(startOfThisWeek, 'yyyy-MM-dd');
  const endWeekString = format(endOfThisWeek, 'yyyy-MM-dd');

  const query = supabase
  .from('upcoming_shifts') // Query the upcoming_shifts table
  .select('*')
  .gte('date', startWeekString) // Get shifts starting from the beginning of the week
  .lte('date', endWeekString);   // Up to the end of the week


  const { data, error } = await query; // Execute the query


  if (error) {
    console.error('Error fetching shifts:', error);
    return undefined;
  } else {
    return data;
  }
}
export async function fetchPastShifts(currentWeek: Date): Promise<Shift[] | undefined> {
  const supabase = createClient();

  const startOfThisWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const startWeekString = format(startOfThisWeek, 'yyyy-MM-dd');
  const endWeekString = format(endOfThisWeek, 'yyyy-MM-dd');

  const query = supabase
  .from('past_shifts') // Query the past_shifts table
  .select('*')
  .gte('date', startWeekString) // Get shifts starting from the beginning of the week
  .lte('date', endWeekString);   // Up to the end of the week


  const { data, error } = await query; // Execute the query


  if (error) {
    console.error('Error fetching shifts:', error);
    return undefined;
  } else {
    return data;
  }
}
export async function fetchOpenShifts(currentWeek: Date): Promise<Shift[] | undefined> {
  const supabase = createClient();

  const startOfThisWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const startWeekString = format(startOfThisWeek, 'yyyy-MM-dd');
  const endWeekString = format(endOfThisWeek, 'yyyy-MM-dd');

  const query = supabase
  .from('open_shifts') // Query the upcoming_shifts table
  .select('*')
  .gte('date', startWeekString) // Get shifts starting from the beginning of the week
  .lte('date', endWeekString);   // Up to the end of the week


  const { data, error } = await query; // Execute the query


  if (error) {
    console.error('Error fetching shifts:', error);
    return undefined;
  } else {
    return data;
  }
}
export async function fetchShiftsForToday(currentDate: Date): Promise<Shift[] | undefined> {
  const supabase = createClient();
  const startOfToday = startOfDay(currentDate);
  const endOfToday = endOfDay(currentDate);

  // Convert dates to dd-mm-yyyy format
  const startDateString = format(startOfToday, 'yyyy-MM-dd');
  const endDateString = format(endOfToday, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('upcoming_shifts')
    .select('*')
    .gte('date', startDateString) // Use formatted date string
    .lte('date', endDateString);   // Use formatted date string

  if (error) {
    console.error('Error fetching shifts for today:', error);
    return undefined;
  } else {
    return data;
  }
}
export async function fetchEmployeeAvailabilityByWeek(currentWeek:Date){
  const supabase = createClient();

  const startOfThisWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const endOfThisWeek = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const { data, error } = await supabase
        .from('availabilities')
        .select('*', { count: 'exact' })
        .gte('week_start', startOfThisWeek.toISOString())
        .lte('week_start', endOfThisWeek.toISOString());

      if (error) {
        console.error('Error fetching availabilities:', error);
        return 0;
      } else {
        return data.length;
      }

}
/**
 * Fetches timesheet data for all employees for a given month
 * @param month - Month in 'yyyy-MM' format (e.g., '2025-10')
 * @returns MonthTimesheetSummary with hours per day per employee
 */
export async function fetchMonthTimesheet(month: string): Promise<MonthTimesheetSummary | undefined> {
  const supabase = createClient();

  try {
    // Parse the month and calculate date range
    const startDate = new Date(`${month}-01`);
    const nextMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

    const startDateString = format(startDate, 'yyyy-MM-dd');
    const endDateString = format(nextMonth, 'yyyy-MM-dd');

    // Fetch all shifts for the month
    const { data, error } = await supabase
      .from('past_shifts')
      .select('id, user_id, date, start_time, end_time')
      .gte('date', startDateString)
      .lt('date', endDateString)
      .order('date', { ascending: true })
      .order('user_id', { ascending: true });

    if (error) {
      console.error('Error fetching month timesheet:', error);
      throw error;
    }

    // Group shifts by date and employee
    const timesheetMap = new Map<string, DailyTimesheet>();

    data?.forEach((shift) => {
      if (!shift.user_id) return;

      const key = `${shift.date}-${shift.user_id}`;
      
      // Calculate shift duration in minutes
      const minutes = calculateShiftMinutes(shift);

      if (!timesheetMap.has(key)) {
        timesheetMap.set(key, {
          date: shift.date,
          employeeId: shift.user_id,
          employeeName: '', // Will be populated by caller if needed
          totalMinutes: 0,
          shifts: [],
        });
      }

      const dailyTimesheet = timesheetMap.get(key)!;
      dailyTimesheet.totalMinutes += minutes;
      dailyTimesheet.shifts.push({
        id: shift.id,
        start_time: shift.start_time,
        end_time: shift.end_time,
        minutes,
      });
    });

    return {
      month,
      dailyTimesheets: Array.from(timesheetMap.values()),
    };
  } catch (error) {
    console.error('Unexpected error fetching month timesheet:', error);
    return undefined;
  }
}

// Helper function to calculate shift minutes (if not already in codebase)
function calculateShiftMinutes(shift: {
  date: string;
  start_time?: string | null;
  end_time?: string | null;
}): number {
  if (!shift.start_time || !shift.end_time) return 0;

  try {
    const startDateTime = new Date(`${shift.date}T${shift.start_time}`);
    const endDateTime = new Date(`${shift.date}T${shift.end_time}`);
    
    const diffMs = endDateTime.getTime() - startDateTime.getTime();
    return Math.round(diffMs / (1000 * 60)); // Convert to minutes
  } catch {
    return 0;
  }
}