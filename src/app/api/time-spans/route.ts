import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("time_spans")
    .select("*")
    .order("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase
    .from("time_spans")
    .insert({
      name: body.name,
      start_time: body.start_time,
      end_time: body.end_time,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "valid id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("time_spans")
    .update({
      name: body.name,
      start_time: body.start_time,
      end_time: body.end_time,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "valid id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("time_spans")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id });
}
