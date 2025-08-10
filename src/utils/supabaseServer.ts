import { Employee, Shift, User } from "@/lib/definitions";
import { createClient } from "./supabase/server";
import { endOfDay, startOfDay } from "date-fns";


export async function getUserName(user_id?:string):Promise<User|undefined>{
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
          email:data[0].email,
          role:data[0].role,
        };
      }
  }

export async function fetchShiftsForToday(currentDate: Date): Promise<Shift[] | undefined> {
  const supabase = createClient();

  const startOfToday = startOfDay(currentDate);
  const endOfToday = endOfDay(currentDate);
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .gte('date', startOfToday.toISOString())
    .lte('date', endOfToday.toISOString());

  if (error) {
    console.error('Error fetching shifts for today:', error);
    return undefined;
  } else {
    return data;
  }
}