import { createClient } from './supabase/client';
import { endOfWeek, startOfWeek, format, startOfDay, endOfDay } from 'date-fns';
import { Shift, UpcomingShift } from '@/lib/definitions';

export async function updateSelectedShifts(updated_shifts:Shift[]){
  

}
export async function pubblishShifts(draft_shifts:Shift[],weekStart:Date){
  const supabase = createClient();

  try {
    const openShifts=draft_shifts.filter(shift=>shift.status==='open');
    const assignedShifts=draft_shifts.filter(shift=>shift.status!=='open');

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