/**
 * Time parsing utilities for handling birth time inputs.
 * Accepts either "HH:MM" or a range like "HH:MM ~ HH:MM" and extracts the starting hour.
 */

/**
 * Regex that matches either a single time or a range with optional spaces around the tilde.
 * Capturing group 1 is the starting hour, group 2 is the starting minute.
 */
export const TIME_OR_RANGE_REGEX: RegExp = /^\s*([0-1]?\d|2[0-3]):([0-5]\d)(?:\s*~\s*([0-1]?\d|2[0-3]):([0-5]\d))?\s*$/;

/**
 * Extract the starting hour from a birth time string.
 * Supports inputs like "09:00" or "09:00 ~ 11:00". Returns a number in the range 0..23.
 * Throws an error if parsing fails.
 * @param value Raw birth time string
 */
export function extractBirthHour(value: string): number {
  const val: string = String(value);
  const match: RegExpMatchArray | null = val.match(TIME_OR_RANGE_REGEX);
  if (!match) {
    throw new Error("Invalid birthTime format. Expected \"HH:MM\" or \"HH:MM ~ HH:MM\"");
  }
  const hourStr: string = match[1];
  const hour: number = Number.parseInt(hourStr, 10);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) {
    throw new Error("Birth hour out of range (0-23)");
  }
  return hour;
}

/**
 * Format a display range based on a birth time string by using the starting hour only.
 * Example: input "23:00 ~ 01:00" → "23:00 - 00:59".
 * @param value Raw birth time string
 */
export function formatHourRangeFromBirthTime(value: string): string {
  const startHour: number = extractBirthHour(value);
  const endHour: number = (startHour + 1) % 24;
  const pad = (n: number): string => n.toString().padStart(2, "0");
  return `${pad(startHour)}:00 - ${pad(endHour)}:59`;
}


