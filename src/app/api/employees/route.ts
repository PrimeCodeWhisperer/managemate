import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Employee } from "@/lib/definitions";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "employee");

  console.log('Raw data from Supabase:', data);
  console.log('Error from Supabase:', error);

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    console.log('No employees found');
    return NextResponse.json([]);
  }

  try {
    const employees: Employee[] = data.map((employee) => ({
      id: employee.id,
      username: employee.username || '',
      avatar_url: employee.avatar_url || '',
      email: employee.email || '',
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
    }));

    console.log('Mapped employees:', employees);
    return NextResponse.json(employees);
  } catch (mappingError) {
    console.error('Error mapping employees:', mappingError);
    return NextResponse.json({ error: 'Error processing employee data' }, { status: 500 });
  }
}