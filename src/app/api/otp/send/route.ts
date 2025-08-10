import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { setOtp } from "@/lib/otp-store";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  const {
    GMAIL_USERNAME,
    GMAIL_PASSWORD,
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
  } = process.env;

  if (!GMAIL_USERNAME || !GMAIL_PASSWORD) {
    return NextResponse.json({ message: "Email env vars not set." }, { status: 500 });
  }
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { message: "Supabase env vars not set." },
      { status: 500 },
    );
  }

  const supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );

  const {
    data: { user },
    error: createUserError,
  } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError || !user) {
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 },
    );
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email,
    role: "employee",
  });

  const otp = generateOtp();
  setOtp(email, otp, 10 * 60 * 1000);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: GMAIL_USERNAME,
      pass: GMAIL_PASSWORD,
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${baseUrl}/login?email=${encodeURIComponent(email)}&otp=${otp}`;

  try {
    await transporter.sendMail({
      from: GMAIL_USERNAME,
      to: email,
      subject: "Your account details",
      text: `Your password is ${password}. Use the following link to login and verify your account: ${loginUrl}`,
      html: `<p>Your password is <strong>${password}</strong></p><p><a href="${loginUrl}">Click here to login with your one-time code</a></p>`,
    });

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
