/**
 * String and regex utility helpers.
 */

export function escapeRegex(text: string): string {
  if (typeof text !== "string") return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export function sanitizeEmail(email?: string | null): string {
  return (email || "").toLowerCase().trim();
}
