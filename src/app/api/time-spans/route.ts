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
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("time_spans")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Time span not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("time_spans")
    .update({
      name: body.name,
      start_time: body.start_time,
      end_time: body.end_time,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id,
    name: body.name,
    start_time: body.start_time,
    end_time: body.end_time,
  });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const id = Number(body.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("time_spans")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Time span not found" }, { status: 404 });
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
