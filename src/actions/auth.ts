"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { ActionResponse } from "@/types";

export async function registerUser(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validatedData = registerSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validatedData.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.data.email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists",
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.data.password, 12);

    // Create user
    await prisma.user.create({
      data: {
        name: validatedData.data.name,
        email: validatedData.data.email.toLowerCase(),
        passwordHash,
        role: "STUDENT", // Default role
      },
    });

    return {
      success: true,
      message: "Account created successfully! You can now log in.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
