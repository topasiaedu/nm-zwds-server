/**
 * Date parsing utilities.
 * Provides a robust normalizer to convert human-readable birthdays like
 * "May 14th 1999" into an ISO date string "1999-05-14".
 */

/** Month name to number map (1-12) supporting short and long names */
const MONTHS: Readonly<Record<string, number>> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/** Zero-pad a number to length 2 */
function pad2(n: number): string { return n.toString().padStart(2, "0"); }

/** Try to parse strings like "May 14th 1999" or "May 14 1999" (case-insensitive) */
function parseMonthDayYear(input: string): { year: number; month: number; day: number } | null {
  const cleaned: string = input.trim().replace(/,/g, "");
  const m = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\d{4})$/i);
  if (!m) return null;
  const monthName: string = m[1].toLowerCase();
  const dayStr: string = m[2];
  const yearStr: string = m[3];
  const month: number | undefined = MONTHS[monthName];
  const day: number = Number.parseInt(dayStr, 10);
  const year: number = Number.parseInt(yearStr, 10);
  if (!month || Number.isNaN(day) || Number.isNaN(year)) return null;
  if (day < 1 || day > 31) return null;
  return { year, month, day };
}

/**
 * Normalize various birthday formats to ISO (YYYY-MM-DD).
 * Accepts:
 * - ISO already: 1999-05-14 (returned unchanged)
 * - Month day(with optional ordinal) year: "May 14th 1999", "May 14 1999"
 * Throws on invalid or unrecognized formats.
 */
export function normalizeBirthdayToISO(birthday: string): string {
  const value: string = String(birthday).trim();
  // ISO short-circuit
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = parseMonthDayYear(value);
  if (parsed) {
    return `${parsed.year}-${pad2(parsed.month)}-${pad2(parsed.day)}`;
  }

  // As a fallback, attempt Date.parse after removing ordinals
  const fallback = value.replace(/(\d{1,2})(st|nd|rd|th)/gi, "$1");
  const t = Date.parse(fallback);
  if (!Number.isNaN(t)) {
    const d = new Date(t);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}-${pad2(m)}-${pad2(day)}`;
  }

  throw new Error("Unsupported birthday format. Use YYYY-MM-DD or Month Day Year (e.g., May 14th 1999)");
}


