import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Employee } from "@/lib/definitions";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "employee");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const employees: Employee[] | undefined = data?.map((employee) => ({
    user_id: employee.id.toString(),
    name: employee.username?.toString(),
    image: employee.avatar_url?.toString(),
    email: employee.email?.toString(),
  }));

  return NextResponse.json(employees ?? []);
}
