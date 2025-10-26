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

  const baseUrl = process.env.PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${baseUrl}/login?email=${encodeURIComponent(user.email ?? email)}`;
  const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@managemate.online";
  const brand = "ManageMate";
  const year = new Date().getFullYear();

  const plainText = [
    `Hi ${username || "there"},`,
    ``,
    `Welcome to ${brand}!`,
    `Your temporary password is: ${password}`,
    `For your security, you'll be asked to change it before you can access your account.`,
    ``,
    `Log in here: ${loginUrl}`,
    ``,
    `If you didn’t request this, you can ignore this email.`,
    `Need help? Contact us at ${supportEmail}`,
  ].join("\n");

const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${brand} – Temporary Password</title>
  <style>
    .preheader { display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    @media (max-width:600px){
      .container { width:100%!important; }
      .p-24 { padding:20px!important; }
      .h1 { font-size:24px!important; line-height:30px!important; }
      .btn { width:100%!important; display:block!important; }
      .code { font-size:20px!important; letter-spacing:2px!important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#0f0f0f; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
  <div class="preheader">
    Your temporary password for ${brand} is ${password}. You'll change it on first login.
  </div>

  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0f0f0f;">
    <tr>
      <td align="center" style="padding:24px;">
        <!-- Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px; max-width:600px; background:#0f0f0f; border-radius:16px; overflow:hidden; border:1px solid #1f2937;">
          
          <!-- Header (monochrome, centered brand, no right text) -->
          <tr>
            <td align="center" style="background:#0f0f0f; padding:24px 24px 16px 24px;">
              <div style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-size:18px; font-weight:700; color:#ffffff; letter-spacing:0.3px;">
                ${brand}
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="p-24" style="padding:28px; font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif; color:#ffffff;">
              <h1 class="h1" style="margin:0 0 10px; font-size:28px; line-height:34px; font-weight:800; color:#ffffff;">Welcome to ${brand}</h1>
              <p style="margin:0; font-size:15px; line-height:22px; color:#d1d5db;">
                Hi ${username || "there"},<br>
                Here are your sign-in details. You’ll be asked to <strong style="color:#ffffff;">change your password</strong> before gaining access.
              </p>
            </td>
          </tr>

          <!-- Temporary password block -->
          <tr>
            <td style="padding:0 28px 8px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px dashed #374151; background:#111827; border-radius:12px;">
                <tr>
                  <td align="center" style="padding:20px;">
                    <div style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-size:12px; color:#9ca3af; padding-bottom:6px;">
                      Temporary password
                    </div>
                    <div class="code" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace; font-weight:800; font-size:22px; letter-spacing:4px; color:#ffffff;">
                      ${password}
                    </div>
                    <div style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-size:12px; color:#9ca3af; padding-top:6px;">
                      You’ll be prompted to change this on first login.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Centered button (bulletproof, monochrome) -->
          <tr>
            <td style="padding:24px 28px 0 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${loginUrl}" arcsize="15%" strokecolor="#ffffff" strokeweight="1px" fillcolor="#ffffff" style="height:48px; v-text-anchor:middle; width:360px;">
                      <w:anchorlock/>
                      <center style="color:#000000; font-family:Segoe UI, Arial, sans-serif; font-size:16px; font-weight:700;">
                        Log in now
                      </center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <a class="btn" href="${loginUrl}" style="background:#ffffff; border:1px solid #ffffff; color:#000000; text-decoration:none; font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-weight:700; font-size:16px; line-height:48px; height:48px; border-radius:12px; display:inline-block;">
                      Log in in now
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:12px 28px 24px 28px; font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-size:12px; color:#9ca3af; text-align:center;">
              Or copy & paste this link:
              <span style="word-break:break-all;">
                <a href="${loginUrl}" style="color:#ffffff; text-decoration:underline;">${loginUrl}</a>
              </span>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 28px 28px 28px; font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif; color:#9ca3af; font-size:12px; text-align:center; background:#0f0f0f;">
              <div style="margin:0 auto; max-width:520px; text-align:left; background:#111827; border:1px solid #1f2937; border-radius:12px; padding:16px;">
                If you didn’t request this, you can ignore this email. For help, contact
                <a href="mailto:${supportEmail}" style="color:#ffffff; text-decoration:underline;">${supportEmail}</a>.
              </div>
              <div style="margin-top:12px;">© ${year} ${brand}</div>
            </td>
          </tr>

        </table>
        <!-- /Card -->
      </td>
    </tr>
  </table>

  <style>
    @media (prefers-color-scheme: dark) {
      body { background:#0f0f0f!important; }
    }
  </style>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `${brand}: Your temporary password & login link`,
      text: plainText,
      html,
    });

    return NextResponse.json({ message: "Email sent" }, { status: 200 });
  } catch (error) {
    console.error("Failed to send email", error);
    const message =
      error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ message }, { status: 500 });
  }
}
