/**
 * Type declarations for solarlunar library
 */

declare module "solarlunar" {
  export interface SolarLunarResult {
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

  export interface SolarLunar {
    solar2lunar(year: number, month: number, day: number): SolarLunarResult;
    lunar2solar(year: number, month: number, day: number, isLeap?: boolean): SolarLunarResult;
    monthDays?(year: number, month: number): number;
    leapDays?(year: number): number;
    leapMonth?(year: number): number;
    gan?: string[];
    zhi?: string[];
  }

  const solarLunar: SolarLunar;
  export default solarLunar;
}