import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { User, Company } from "@/lib/definitions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, avatar_url, email, role, company_id")
    .eq("id", id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let company: Company | undefined;
  if (data.company_id) {
    const { data: companyData } = await supabase
      .from("companies")
      .select("id, company_name")
      .eq("id", data.company_id)
      .single();
    if (companyData) {
      company = { id: companyData.id, name: companyData.company_name };
    }
  }

  const user: User = {
    id: data.id,
    username: data.username,
    first_name: data.first_name,
    last_name: data.last_name,
    avatar_url: data.avatar_url,
    email: data.email,
    role: data.role,
    company_id: data.company_id,
    company,
  };

  return NextResponse.json(user);
}
