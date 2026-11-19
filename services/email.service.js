import nodemailer from "nodemailer";

// One shared transporter for the whole process
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (email, otp, purpose = "signup") => {
  const action = purpose === "login" ? "log in to" : "verify";
  const subject =
    purpose === "login"
      ? "Your Begin login code"
      : "Your Begin verification code";

  await transporter.sendMail({
    from: `"Begin" <${process.env.SMTP_FROM}>`,
    to: email,
    subject,

    // Plain text fallback
    text: `Your Begin code is ${otp}. It expires in 5 minutes.\n\nIf you didn't ask for this, ignore this email.`,

    // Styled HTML
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #e5e5e5;border-radius:12px;">
        <h2 style="margin:0 0 8px;font-size:22px;color:#111;">Begin — College Campus Startup Platform</h2>
        <p style="color:#707072;margin:0 0 24px;font-size:14px;">Use the code below to ${action} your account. It expires in <strong>5 minutes</strong>.</p>

        <div style="background:#f5f5f5;border-radius:8px;padding:24px;text-align:center;letter-spacing:8px;font-size:36px;font-weight:700;color:#111;font-family:'JetBrains Mono',monospace;">
          ${otp}
        </div>

        <p style="color:#707072;font-size:12px;margin:24px 0 0;">Didn't request this? You can safely ignore this email. This code is single-use and will expire automatically.</p>
      </div>
    `,
  });
};
