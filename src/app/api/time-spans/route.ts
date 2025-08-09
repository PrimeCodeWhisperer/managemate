import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
  const body = await request.json();
  const id = Number(body.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
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
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Time span not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const body = await request.json();
  const id = Number(body.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("time_spans")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Time span not found" }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}
