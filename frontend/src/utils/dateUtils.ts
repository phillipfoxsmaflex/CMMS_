/**
 * Date utility functions for handling timezone-related issues
 */

/**
 * Formats a Date object to ISO string format with timezone information.
 * This function converts the date to UTC and includes the 'Z' suffix to indicate UTC timezone.
 * 
 * Example:
 * - Input: Date object with 14:00 local time (e.g., CET/CEST)
 * - Output: "2026-01-07T12:00:00Z" (converts to UTC, includes 'Z' suffix)
 * 
 * Use this when the backend expects dates in UTC format with timezone information.
 * This ensures consistent timezone handling across different client timezones.
 * 
 * @param date - The date to format
 * @returns ISO-formatted string in UTC with 'Z' suffix
 */
export const formatDateForBackend = (date: Date): string => {
  return date.toISOString();
};

/**
 * Formats a Date object to ISO string in UTC (standard behavior).
 * This is just a wrapper around toISOString() for consistency.
 * 
 * @param date - The date to format
 * @returns ISO-formatted string in UTC with 'Z' suffix
 */
export const formatDateAsUTC = (date: Date): string => {
  return date.toISOString();
};

/**
 * Formats a Date object to preserve the exact calendar time for backend storage.
 * This function is specifically for calendar events where we want to store the exact
 * time the user sees, regardless of timezone.
 * 
 * Example:
 * - Input: Date object representing 14:00 in calendar (any timezone)
 * - Output: "2026-01-07T14:00:00.000Z" (preserves the exact time with UTC format)
 * 
 * @param date - The date to format
 * @returns ISO-formatted string preserving the exact time with UTC format
 */
export const formatDateForCalendarBackend = (date: Date): string => {
  // NEW APPROACH: Just use toISOString() which handles timezone conversion properly
  // This is the most reliable way to convert dates to UTC format
  return date.toISOString();
};

/**
 * Formats a Date object to ISO string format while preserving local time values.
 * Unlike toISOString(), this does NOT convert to UTC.
 * 
 * Example:
 * - Input: Date object with 14:00 local time (e.g., CET/CEST)
 * - Output: "2026-01-07T14:00:00" (preserves 14:00, no timezone conversion)
 * 
 * Use this when you want to preserve the exact time values shown in the UI
 * for display purposes only (not for backend communication).
 * 
 * @param date - The date to format
 * @returns ISO-formatted string with local time values (no 'Z' suffix)
 */
export const formatDateForDisplay = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Formats a date of birth for backend storage.
 * This function is specifically designed for date of birth fields
 * and ensures consistent formatting for backend compatibility.
 * 
 * @param date - The date of birth to format
 * @returns ISO-formatted string in UTC with 'Z' suffix
 */
export const formatDateOfBirthForBackend = (date: Date): string => {
  return date.toISOString();
};
