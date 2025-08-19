import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PendingEmployee } from "@/lib/definitions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role","pending")
    .eq("company_id", companyId);

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json([]);
  }

  const pending: PendingEmployee[] = data.map((row: any) => ({
    id: row.id,
    email: row.email,
    username: row.username ?? undefined,
  }));

  return NextResponse.json(pending);
}
