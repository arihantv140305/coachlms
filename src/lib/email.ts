import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "CoachLMS <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resend = getResend();
  if (!resend) {
    console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
    return { success: true, skipped: true };
  }

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) { console.error("Email send error:", error); return { success: false, error }; }
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
}

// --- Email Templates ---

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Reset your CoachLMS password",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:500px;margin:auto;padding:20px;">
        <h2 style="color:#6366f1;">CoachLMS — Password Reset</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
        </div>
        <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Verify your CoachLMS account",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:500px;margin:auto;padding:20px;">
        <h2 style="color:#6366f1;">Welcome to CoachLMS!</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email to complete your account setup:</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${verifyUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Verify Email</a>
        </div>
        <p style="color:#888;font-size:13px;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendAnnouncementEmail(to: string[], courseTitle: string, title: string, content: string) {
  const results = [];
  for (const email of to) {
    const result = await sendEmail({
      to: email,
      subject: `[${courseTitle}] ${title}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:500px;margin:auto;padding:20px;">
          <h2 style="color:#6366f1;">📢 New Announcement</h2>
          <p style="color:#888;font-size:13px;">Course: ${courseTitle}</p>
          <h3>${title}</h3>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
            ${content.replace(/\n/g, "<br>")}
          </div>
          <a href="${APP_URL}/dashboard" style="color:#6366f1;text-decoration:none;">Go to CoachLMS →</a>
        </div>
      `,
    });
    results.push(result);
  }
  return results;
}

export async function sendAssignmentEmail(to: string[], courseTitle: string, assignmentTitle: string, dueDate: string) {
  const results = [];
  for (const email of to) {
    const result = await sendEmail({
      to: email,
      subject: `[${courseTitle}] New Assignment: ${assignmentTitle}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:500px;margin:auto;padding:20px;">
          <h2 style="color:#6366f1;">📝 New Assignment</h2>
          <p style="color:#888;font-size:13px;">Course: ${courseTitle}</p>
          <h3>${assignmentTitle}</h3>
          <p><strong>Due:</strong> ${dueDate}</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}/dashboard" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Assignment</a>
          </div>
        </div>
      `,
    });
    results.push(result);
  }
  return results;
}

export async function sendGradeEmail(to: string, courseTitle: string, assignmentTitle: string, marks: number, totalMarks: number, feedback?: string) {
  return sendEmail({
    to,
    subject: `[${courseTitle}] Grade Released: ${assignmentTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:500px;margin:auto;padding:20px;">
        <h2 style="color:#6366f1;">📊 Grade Released</h2>
        <p style="color:#888;font-size:13px;">Course: ${courseTitle}</p>
        <h3>${assignmentTitle}</h3>
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;text-align:center;">
          <p style="font-size:32px;font-weight:bold;color:#6366f1;margin:0;">${marks}/${totalMarks}</p>
        </div>
        ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ""}
        <a href="${APP_URL}/dashboard" style="color:#6366f1;text-decoration:none;">View in CoachLMS →</a>
      </div>
    `,
  });
}
