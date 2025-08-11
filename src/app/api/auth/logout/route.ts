import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { useSupabaseData } from "@/contexts/SupabaseContext";

export async function POST() {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create response with success
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    //Clear localStorage

    // Clear auth cookies
    response.cookies.set('supabase-auth-token', '', {
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error: any) {
    console.error('Unexpected logout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}