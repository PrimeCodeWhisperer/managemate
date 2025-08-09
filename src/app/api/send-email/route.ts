import { NextResponse, type NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

type EmailRequestBody = {
  name: string;
  email: string;
  message: string;
};

export async function POST(req: NextRequest) {
  const { name, email, message } = (await req.json()) as EmailRequestBody;

  const { GMAIL_USERNAME, GMAIL_PASSWORD } = process.env;
  if (!GMAIL_USERNAME || !GMAIL_PASSWORD) {
    return NextResponse.json({ message: 'Email env vars not set.' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: GMAIL_USERNAME,
      pass: GMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: GMAIL_USERNAME,
      to: 'recipient@example.com',
      subject: `New message from ${name}`,
      text: message,
      replyTo: email,
    });

    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to send email.' }, { status: 500 });
  }
}
