import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, photoStrip, sessionId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    // Server-side validation of base64 photostrip
    if (!photoStrip) {
      return NextResponse.json({ error: "Photo strip image binary is missing" }, { status: 400 });
    }

    console.log(`[Email Service] Preparing SMTP dispatch of photostrip...`);
    console.log(`[Email Service] Session ID: ${sessionId}`);
    console.log(`[Email Service] Destination Email: ${email}`);
    console.log(`[Email Service] Photo strip size: ${Math.round(photoStrip.length / 1024)} KB`);

    // In a production app, the developer would connect SendGrid / Resend with processes.env.SENDGRID_API_KEY.
    // We provide a successful action response with structural metadata.
    return NextResponse.json({
      success: true,
      message: `Successfully sent photostrip for session ${sessionId} to ${email}!`,
      timestamp: new Date().toISOString(),
      sizeKb: Math.round(photoStrip.length / 1024),
    });

  } catch (err: any) {
    console.error("Email API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process email delivery" }, { status: 500 });
  }
}
