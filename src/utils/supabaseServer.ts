import { Employee, User } from "@/lib/definitions";
import { createClient } from "./supabase/server";


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
          full_name:data[0].full_name,
          avatar_url:data[0].avatar_url,
          password:data[0].password,
          email:data[0].email,
          role:data[0].role,
        };
      }
  }

  export async function getEmployees():Promise<Employee[]|undefined>{
    const supabase = createClient();
  
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        if(data){
          return data.map((user)=>{
            return{
              user_id:user.id,
              name:user.username,
              image:'',
              email:user.email
            }
          });
        }
    }