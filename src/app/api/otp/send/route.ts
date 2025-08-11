import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/utils/supabase/server";


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
  } = process.env;

  if (!GMAIL_USERNAME || !GMAIL_PASSWORD) {
    return NextResponse.json({ message: "Email env vars not set." }, { status: 500 });
  }

  const supabase = createClient();

  const {
    data: { user },
    error: createUserError,
  } = await supabase.auth.admin.createUser({
    email:email,
    password:password
  });
  
  if(user){
    const{error}=await supabase.from("profiles").update({role:"employee"}).eq("id",user.id)
    console.log(error)
  }

  if (createUserError || !user) {
    return NextResponse.json(
      {
        message: createUserError?.message || "Failed to create user",
      },
      { status: 500 },
    );
  }

  
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
  const loginUrl = `${baseUrl}/login?complete=${user.email}`;

  try {
    await transporter.verify();

    await transporter.sendMail({
      from: GMAIL_USERNAME,
      to: email,
      subject: "Your account details",
      text: `Your password is ${password}. Use the following link to login and verify your account: ${loginUrl}`,
      html: `<p>Your password is <strong>${password}</strong></p><p><a href="${loginUrl}">Click here to login with your one-time code</a></p>`,
    });

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch (error) {
    console.error("Failed to send OTP", error);
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ message }, { status: 500 });
  }
}
