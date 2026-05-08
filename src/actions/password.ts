"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { ActionResponse } from "@/types";

export async function requestPasswordReset(email: string): Promise<ActionResponse> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return { success: true, message: "If an account with that email exists, we sent a reset link." };

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });
    await sendPasswordResetEmail(email, token, user.name);

    return { success: true, message: "If an account with that email exists, we sent a reset link." };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<ActionResponse> {
  try {
    if (newPassword.length < 8) return { success: false, message: "Password must be at least 8 characters" };

    const reset = await prisma.passwordReset.findUnique({ where: { token }, include: { user: true } });
    if (!reset) return { success: false, message: "Invalid or expired reset link" };
    if (reset.used) return { success: false, message: "This reset link has already been used" };
    if (reset.expiresAt < new Date()) return { success: false, message: "This reset link has expired" };

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } });
    await prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } });

    return { success: true, message: "Password reset successfully. You can now log in." };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function requestEmailVerification(userId: string): Promise<ActionResponse> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "User not found" };
    if (user.emailVerified) return { success: false, message: "Email already verified" };

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });
    await sendVerificationEmail(user.email, token, user.name);

    return { success: true, message: "Verification email sent" };
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, message: "Failed to send verification email" };
  }
}

export async function verifyEmail(token: string): Promise<ActionResponse> {
  try {
    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset) return { success: false, message: "Invalid verification link" };
    if (reset.used) return { success: false, message: "Already verified" };
    if (reset.expiresAt < new Date()) return { success: false, message: "Link expired" };

    await prisma.user.update({ where: { id: reset.userId }, data: { emailVerified: true } });
    await prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } });

    return { success: true, message: "Email verified successfully!" };
  } catch (error) {
    return { success: false, message: "Verification failed" };
  }
}

export async function bulkImportUsers(csvData: string): Promise<ActionResponse> {
  try {
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) return { success: false, message: "CSV must have a header row and at least one data row" };

    const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const nameIdx = header.indexOf("name");
    const emailIdx = header.indexOf("email");
    const roleIdx = header.indexOf("role");
    const passwordIdx = header.indexOf("password");

    if (nameIdx === -1 || emailIdx === -1) return { success: false, message: "CSV must have 'name' and 'email' columns" };

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const name = cols[nameIdx];
      const email = cols[emailIdx];
      const role = roleIdx !== -1 ? cols[roleIdx]?.toUpperCase() : "STUDENT";
      const password = passwordIdx !== -1 ? cols[passwordIdx] : "Welcome@123";

      if (!name || !email) { errors.push(`Row ${i + 1}: Missing name or email`); continue; }
      if (!email.includes("@")) { errors.push(`Row ${i + 1}: Invalid email "${email}"`); continue; }
      if (!["ADMIN", "INSTRUCTOR", "STUDENT"].includes(role)) { errors.push(`Row ${i + 1}: Invalid role "${role}"`); continue; }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) { skipped++; continue; }

      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.create({ data: { name, email, passwordHash, role: role as any, isActive: true } });
      created++;
    }

    const msg = `Created ${created} users, skipped ${skipped} existing.${errors.length > 0 ? ` ${errors.length} errors.` : ""}`;
    return { success: true, message: msg, data: { created, skipped, errors } as any };
  } catch (error) {
    console.error("Bulk import error:", error);
    return { success: false, message: "Import failed" };
  }
}
