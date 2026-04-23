import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Generate a random join code (6 chars, uppercase alphanumeric)
export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid confusing chars: 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate a course code from title
export function generateCourseCode(title: string): string {
  const base = title
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${base || "CRS"}-${suffix}`;
}

// Format date for display
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format date for datetime-local input
export function formatDateForInput(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
