import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface DataRequestBody {
  email: string;
  fullName: string;
  requestType: string;
  details?: string;
  verificationMethod: string;
}

const requestTypeLabels: Record<string, string> = {
  access: "Data Access Request",
  rectification: "Data Rectification Request",
  erasure: "Data Erasure Request",
  portability: "Data Portability Request",
  restriction: "Data Processing Restriction Request",
  objection: "Data Processing Objection",
  "withdraw-consent": "Consent Withdrawal Request",
};

export async function POST(request: NextRequest) {
  try {
    const body: DataRequestBody = await request.json();
    
    // Basic validation
    if (!body.email || !body.fullName || !body.requestType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create email transporter (using existing Gmail setup)
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const requestLabel = requestTypeLabels[body.requestType] || "Data Request";
    const timestamp = new Date().toISOString();
    const requestId = `DR-${Date.now()}`;

    // Email to privacy team/admin
    const adminEmailContent = `
      <h2>New GDPR Data Request Received</h2>
      <p><strong>Request ID:</strong> ${requestId}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Type:</strong> ${requestLabel}</p>
      
      <h3>User Information</h3>
      <ul>
        <li><strong>Name:</strong> ${body.fullName}</li>
        <li><strong>Email:</strong> ${body.email}</li>
        <li><strong>Verification Method:</strong> ${body.verificationMethod}</li>
      </ul>
      
      ${body.details ? `
        <h3>Additional Details</h3>
        <p>${body.details.replace(/\n/g, '<br>')}</p>
      ` : ''}
      
      <hr>
      <p><em>This request must be processed within 30 days under GDPR requirements.</em></p>
      <p>Respond to the user at: <a href="mailto:${body.email}">${body.email}</a></p>
    `;

    // Email to user (confirmation)
    const userEmailContent = `
      <h2>Your Data Request Has Been Received</h2>
      <p>Dear ${body.fullName},</p>
      
      <p>Thank you for your data request. We have received your ${requestLabel.toLowerCase()} and will process it in accordance with GDPR requirements.</p>
      
      <h3>Request Details</h3>
      <ul>
        <li><strong>Request ID:</strong> ${requestId}</li>
        <li><strong>Date Submitted:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>Type:</strong> ${requestLabel}</li>
      </ul>
      
      <h3>What Happens Next?</h3>
      <ol>
        <li>We may need to verify your identity before processing your request</li>
        <li>We will process your request within 30 days as required by GDPR</li>
        <li>You will receive an email with the results or any additional steps needed</li>
      </ol>
      
      <p>If you have any questions, please contact us at <a href="mailto:privacy@managemate.app">privacy@managemate.app</a> and reference your Request ID: ${requestId}</p>
      
      <hr>
      <p>Best regards,<br>
      ManageMate Privacy Team</p>
      
      <p><small>This is an automated response. Please do not reply to this email. For questions, use privacy@managemate.app</small></p>
    `;

    // Send email to admin/privacy team
    await transporter.sendMail({
      from: process.env.GMAIL_USERNAME,
      to: process.env.PRIVACY_EMAIL || process.env.GMAIL_USERNAME,
      subject: `GDPR Data Request - ${requestLabel} - ${requestId}`,
      html: adminEmailContent,
      replyTo: body.email,
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.GMAIL_USERNAME,
      to: body.email,
      subject: `Data Request Confirmation - ${requestId}`,
      html: userEmailContent,
    });

    // Log the request (you might want to store this in your database)
    console.log(`GDPR Data Request received: ${requestId}`, {
      type: body.requestType,
      email: body.email,
      timestamp,
    });

    return NextResponse.json(
      { 
        message: "Request submitted successfully",
        requestId,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing data request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}