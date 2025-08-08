import solarLunar from "solarlunar";

interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
}

// Define the proper type for solarlunar result
interface SolarLunarResult {
  lYear: number;
  lMonth: number;
  lDay: number;
  animal: string;
  monthCn: string;
  dayCn: string;
  cYear: number;
  cMonth: number;
  cDay: number;
  gzYear: string;
  gzMonth: string;
  gzDay: string;
  isToday: boolean;
  isLeap: boolean;
  nWeek: number;
  ncWeek: string;
  isTerm: boolean;
  term: string;
}

export const lunar = {
  convertSolarToLunar(year: number, month: number, day: number): LunarDate {
    // Validate input
    if (year < 1900 || year > 2100) {
      throw new Error("Year must be between 1900 and 2100");
    }

    const result = solarLunar.solar2lunar(year, month, day) as SolarLunarResult;
    
    return {
      year: result.lYear,
      month: result.lMonth,
      day: result.lDay,
      isLeap: result.isLeap
    };
  },

  getLunarYearDays(year: number): number {
    // Validate input
    if (year < 1900 || year > 2100) {
      throw new Error("Year must be between 1900 and 2100");
    }
    
    // Since solarlunar doesn't expose the exact function we need,
    // we'll calculate using a workaround
    const leapMonth = this.getLeapMonth(year);
    
    // Calculate total days in the year
    let totalDays = 0;
    for (let month = 1; month <= 12; month++) {
      if ((solarLunar as any).monthDays) {
        totalDays += (solarLunar as any).monthDays(year, month);
      } else {
        // Default to 29 or 30 days
        totalDays += (month % 2 === 1) ? 30 : 29;
      }
    }
    
    // Add leap month days if there is a leap month
    if (leapMonth > 0 && (solarLunar as any).leapDays) {
      totalDays += (solarLunar as any).leapDays(year);
    }
    
    return totalDays;
  },

  getLeapMonth(year: number): number {
    // Validate input
    if (year < 1900 || year > 2100) {
      throw new Error("Year must be between 1900 and 2100");
    }
    
    // Use type assertion since TypeScript doesn't know about this method
    if ((solarLunar as any).leapMonth) {
      return (solarLunar as any).leapMonth(year);
    }
    
    // Fallback - get information from a date conversion
    // This is a workaround and may not be 100% accurate
    for (let month = 1; month <= 12; month++) {
      const date = solarLunar.lunar2solar(year, month, 1, true) as SolarLunarResult;
      if (date && date.isLeap) {
        return month;
      }
    }
    
    return 0;
  }
};

// Constants for stems and branches - using type assertion since TypeScript doesn't know about these properties
export const HeavenlyStems = (solarLunar as any).gan || ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const EarthlyBranches = (solarLunar as any).zhi || ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// Helper function to get the stem-branch year
export const getStemBranchYear = (year: number): string => {
  const result = solarLunar.solar2lunar(year, 1, 1) as SolarLunarResult;
  return result.gzYear;
}; 