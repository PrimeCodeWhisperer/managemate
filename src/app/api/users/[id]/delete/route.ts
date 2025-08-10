import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient(process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { error } = await supabase.auth.admin.deleteUser(params.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
