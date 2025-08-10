import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json(
      { message: "Email and code are required" },
      { status: 400 }
    );
  }

  const valid = verifyOtp(email, code);

  if (!valid) {
    return NextResponse.json(
      { message: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "OTP verified" }, { status: 200 });
}
