import { createClient } from './supabase/client';
import { endOfWeek, startOfWeek, format, startOfDay, endOfDay } from 'date-fns';
import { Employee,Shift,User } from '@/lib/definitions';


export async function getUser(user_id?:string):Promise<User|undefined>{
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id',user_id);
    if(data){
      return {
        id:data[0].id,
        username:data[0].username,
        first_name:data[0].first_name,
        last_name:data[0].last_name,
        avatar_url:data[0].avatar_url,
        password:data[0].password,
        email:data[0].email,
        role:data[0].role,
      };
    }
}
export async function updateSelectedShifts(updated_shifts:Shift[]){
  

}
export async function pubblishShifts(draft_shifts:Shift[],weekStart:Date){
  const supabase = createClient();

  try {
    const data_for_db = draft_shifts.map((d) => ({
      user_id: d.user_id,
      date: format(d.date, 'yyyy-MM-dd'), // Convert Date to YYYY-MM-DD string
      start_time: d.start_time,
      end_time: d.end_time,
      status: 'planned',
    }))

    const { data, error } = await supabase.from('shifts').insert(data_for_db)

    await supabase.from('week_shifts').insert({week_start:format(weekStart,'yyyy-MM-dd')})

    if (error) {
      console.error('Error while inserting shifts:', error)
      throw error
    }

    console.log('Shifts inserted successfully:', data)
    
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
  console.log(endOfThisWeek)
  if(error){
    console.error('Error fetching shifts planning:', error);
    return false;
  }else{
    const ret_val=data.length?true:false;
    return ret_val;
  }
}
export async function fetchShifts(currentWeek:Date):Promise<Shift[]|undefined>{
  const supabase = createClient();

  const startOfThisWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(currentWeek, { weekStartsOn: 1 });
  
  const startWeekString = format(startOfThisWeek, 'yyyy-MM-dd');
  const endWeekString = format(endOfThisWeek, 'yyyy-MM-dd');

  const {data, error}= await supabase
    .from('shifts')
    .select('*')
    .gte('date', startWeekString)
    .lte('date',endWeekString );
  console.log(startWeekString,endWeekString)
console.log(data)
  if(error){
    console.error('Error fetching shifts:', error);
    return undefined;
  }else{
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
    .from('shifts')
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
export async function fetchEmployees():Promise<Employee[]|undefined>{
  
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles').select('*',{count:'exact'}).eq('role','employee')
  console.log(data)
  if(data){
    const emp:Employee[]=data.map((employee)=>{
      return{
        user_id:employee.id.toString(),
        name:employee.username.toString(),        
        image:employee.avatar_url?.toString(),  
        email:employee.email?.toString(),      
      };
    })
    return emp;
  }
}