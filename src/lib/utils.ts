import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate duration between two time strings (HH:MM format) and return a human-readable string in Arabic
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Human-readable duration string (e.g., "3 ساعات", "1 ساعة و 30 دقيقة")
 */
export function calculateWorkshopDuration(startTime: string | null | undefined, endTime: string | null | undefined): string {
  if (!startTime || !endTime) {
    return "";
  }

  try {
    // Parse start time
    const [startHour, startMin] = startTime.split(":").map(Number);
    if (isNaN(startHour) || isNaN(startMin)) return "";

    // Parse end time
    const [endHour, endMin] = endTime.split(":").map(Number);
    if (isNaN(endHour) || isNaN(endMin)) return "";

    // Calculate total minutes
    const startTotalMinutes = startHour * 60 + startMin;
    let endTotalMinutes = endHour * 60 + endMin;

    // Handle cases where end time is on the next day (e.g., 23:00 to 01:00)
    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }

    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0 && minutes > 0) {
      return `${minutes} دقيقة${minutes > 10 ? "" : minutes > 2 ? "" : minutes === 2 ? "تان" : "ة"}`;
    } else if (minutes === 0) {
      return `${hours} ساعة${hours > 10 ? "" : hours > 2 ? "" : hours === 2 ? "تان" : "ة"}`;
    } else {
      return `${hours} ساعة و ${minutes} دقيقة`;
    }
  } catch {
    return "";
  }
}

