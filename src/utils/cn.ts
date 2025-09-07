import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names intelligently.
 * Supports conditional classes via clsx,
 * then merges Tailwind classes to handle conflicts.
 */
export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}