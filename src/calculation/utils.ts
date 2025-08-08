import solarLunar from "solarlunar";

/**
 * Utility functions for Zi Wei Dou Shu calculations
 */

// import { LUNAR_DAY_MAP } from "./constants";
import { Palace, Star } from "./types";

/**
 * Convert a number to its corresponding Chinese numeral
 */
export function toChineseNumeral(num: number): string {
  const numerals = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
  return numerals[num - 1] || num.toString();
}

/**
 * Calculate the modulo with proper handling of negative numbers
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Convert hour to Earthly Branch number (1-12)
 */
export function hourToBranch(hour: number): number {
  return mod(Math.floor((hour + 1) / 2), 12) + 1;
}

/**
 * Convert month to Earthly Branch number (1-12)
 */
export function monthToBranch(month: number): number {
  return mod(month + 2, 12) + 1;
}

/**
 * Calculate the Heavenly Stem from a number (1-10)
 */
export function numberToStem(num: number): number {
  return mod(num - 1, 10) + 1;
}

/**
 * Calculate the Earthly Branch from a number (1-12)
 */
export function numberToBranch(num: number): number {
  return mod(num - 1, 12) + 1;
}

/**
 * Calculate the distance between two palace numbers (1-12)
 */
export function palaceDistance(from: number, to: number): number {
  return mod(to - from, 12) + 1;
}

/**
 * Calculate the opposite palace number (1-12)
 */
export function oppositePalace(palace: number): number {
  return mod(palace + 5, 12) + 1;
}

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Calculate the number of days in a month
 */
export function daysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return days[month - 1] || 30;
}

/**
 * Calculate the Julian Day Number for a given date
 */
export function toJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * Calculate the day of week (0-6, where 0 is Sunday)
 */
export function dayOfWeek(year: number, month: number, day: number): number {
  const jd = toJulianDay(year, month, day);
  return mod(jd + 1, 7);
}

/**
 * Convert hour (0-23) to Earthly Branch (1-12)
 */
export function getHourBranch(hour: number): number {
  // Log the input
  
  // Validate hour is a number
  if (typeof hour !== 'number' || isNaN(hour)) {
    console.error("Invalid hour for getHourBranch:", hour);
    throw new Error(`Invalid hour: ${hour}. Hour must be a number.`);
  }
  
  // Ensure hour is within 0-23 range
  if (hour < 0 || hour >= 24) {
    console.error("Hour out of range for getHourBranch:", hour);
    throw new Error(`Hour out of range: ${hour}. Hour must be between 0 and 23.`);
  }
  
  // Convert hour to Earthly Branch
  // Hour 23-1 = Branch 1 (子)
  // Hour 1-3 = Branch 2 (丑) 
  // and so on...
  
  // Calculate the branch based on 2-hour periods
  let branch = Math.floor(hour / 2) + 1;
  
  // Special case for 23:00 - 00:59 (should be branch 1)
  if (hour >= 23 || hour < 1) {
    branch = 0;
  }
  
  return branch;
}

/**
 * Convert a solar (Gregorian) date to a lunar day string (e.g., "初一", "初二", etc.)
 * @param year Solar year (e.g., 2024)
 * @param month Solar month (1-12)
 * @param day Solar day
 * @returns Lunar day string (e.g., "初一", "初二", etc.)
 */
export function getLunarDayFromBirthday(year: number, month: number, day: number): string {
  const lunarInfo = solarLunar.solar2lunar(year, month, day);

  if (!lunarInfo || !lunarInfo.lDay) {
    console.warn(`Failed to convert solar date ${year}-${month}-${day}`);
    return "未知";
  }

  // Lunar day names mapping
  const lunarDayMap: string[] = [
    "", "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
  ];

  const lunarDay = lunarDayMap[lunarInfo.lDay];

  return lunarDay || "未知";
}

/**
 * Convert a day number to lunar day string notation
 * @param day Day number (1-30)
 * @returns Lunar day string (e.g., "初一", "初二", etc.)
 */
export function getLunarDayString(day: number): string {
  // Ensure day is between 1 and 30
  if (day < 1 || day > 30) {
    console.error(`Invalid lunar day number: ${day}`);
    return "初一"; // Default to first day if invalid
  }

  // Mapping of day numbers to their lunar string representations
  const lunarDayMap: Record<number, string> = {
    1: "初一",
    2: "初二",
    3: "初三",
    4: "初四",
    5: "初五",
    6: "初六",
    7: "初七",
    8: "初八",
    9: "初九",
    10: "初十",
    11: "十一",
    12: "十二",
    13: "十三",
    14: "十四",
    15: "十五",
    16: "十六",
    17: "十七",
    18: "十八",
    19: "十九",
    20: "二十",
    21: "廿一",
    22: "廿二",
    23: "廿三",
    24: "廿四",
    25: "廿五",
    26: "廿六",
    27: "廿七",
    28: "廿八",
    29: "廿九",
    30: "三十"
  };

  return lunarDayMap[day] || "初一";
}

/**
 * Find a star by name in all palaces
 */
export function findStarByName(palaces: Palace[], name: string): { star: Star; palace: number } | null {
  for (let i = 0; i < palaces.length; i++) {
    const palace = palaces[i];
    if (!palace) continue;
    
    // Check main stars
    if (palace.mainStar && palace.mainStar.length > 0) {
      for (const star of palace.mainStar) {
        if (star.name === name) {
          return { star, palace: i + 1 };
        }
      }
    }
    
    // Check minor stars
    for (const star of palace.minorStars) {
      if (star.name === name) {
        return { star, palace: i + 1 };
      }
    }
    
    // Check auxiliary stars
    for (const star of palace.auxiliaryStars) {
      if (star.name === name) {
        return { star, palace: i + 1 };
      }
    }
    
    // Check year stars
    for (const star of palace.yearStars) {
      if (star.name === name) {
        return { star, palace: i + 1 };
      }
    }
    
    // Check month stars
    for (const star of palace.monthStars) {
      if (star.name === name) {
        return { star, palace: i + 1 };
      }
    }
    
    // Check day stars
    for (const star of palace.dayStars) {
      if (star.name === name) {
        return { star, palace: i + 1 };
      }
    }
    
    // Check hour stars
    for (const star of palace.hourStars) {
      if (star.name === name) {
        return { star, palace: i + 1 };
      }
    }
  }
  
  return null;
} 