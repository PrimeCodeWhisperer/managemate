import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { message: "Resend API key is not configured." },
      { status: 500 },
    );
  }

  const supabase = createClient();

  const {
    data: { user },
    error: createUserError,
  } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (createUserError || !user) {
    return NextResponse.json(
      {
        message: createUserError?.message || "Failed to create user",
      },
      { status: 500 },
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${baseUrl}/login?email=${user.email}`;
  const fromAddress =
    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: "Your ManageMate account details",
      text: `Your password is ${password}. Use the following link to login and verify your account: ${loginUrl}`,
      html: ` <p>Your password is <strong>${password}</strong></p>
              <p><a href="${loginUrl}">Click here to login with your one-time code</a></p>
              <br/>
              <p>This email has been auto-generated so please do not reply to it</p>`,
    });

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch (error) {
    console.error("Failed to send OTP", error);
    const message =
      error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ message }, { status: 500 });
  }
}
