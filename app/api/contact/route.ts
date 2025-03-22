import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json();

  if (!process.env.EMAIL_PASSWORD) {
    return NextResponse.json(
      { error: "Email password is not configured." },
      { status: 500 },
    );
  }

  // Configure the transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "advertisinganalyticsdashboard@gmail.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "advertisinganalyticsdashboard@gmail.com",
    to: "contact@advertisinganalyticsdashboard.com",
    subject: `Contact Us Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 },
    );
  }
}
