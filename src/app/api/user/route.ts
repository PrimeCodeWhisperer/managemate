import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { User } from "@/lib/definitions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  console.log(data)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const user: User = {
    id: data.id,
    username: data.username,
    first_name: data.first_name,
    last_name: data.last_name,
    avatar_url: data.avatar_url,
    email: data.email,
    role: data.role,
  };

  return NextResponse.json(user);
}
