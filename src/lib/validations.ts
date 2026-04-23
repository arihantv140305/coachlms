import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  maxStudents: z.coerce.number().min(1).max(500).default(50),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const joinCourseSchema = z.object({
  joinCode: z
    .string()
    .length(6, "Join code must be exactly 6 characters")
    .toUpperCase(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]).optional(),
  isActive: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type JoinCourseInput = z.infer<typeof joinCourseSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
