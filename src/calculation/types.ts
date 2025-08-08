import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from './constants';
/**
 * Types for Zi Wei Dou Shu calculations
 */

/**
 * Base types for the lookup tables
 */
export type FiveElementType = "水二局" | "木三局" | "金四局" | "土五局" | "火六局";
export type EarthlyBranchType =  typeof EARTHLY_BRANCHES[number];
export type HeavenlyStemType = typeof HEAVENLY_STEMS[number];
export type LunarDayString = "初一" | "初二" | "初三" | "初四" | "初五" | "初六" | "初七" | "初八" | "初九" | "初十" | "十一" | "十二" | "十三" | "十四" | "十五" | "十六" | "十七" | "十八" | "十九" | "二十" | "廿一" | "廿二" | "廿三" | "廿四" | "廿五" | "廿六" | "廿七" | "廿八" | "廿九" | "三十";

/**
 * Lookup table types
 */
export type EarthlyBranchMap = {
  [K in EarthlyBranchType]?: FiveElementType;
};

export type FiveElementsTable = {
  [K in HeavenlyStemType]: EarthlyBranchMap;
};

export type ZiWeiPositionsTable = {
  [K in LunarDayString]: {
    [P in FiveElementType]: number;
  };
};

/**
 * Represents a single star in the chart
 */
export type Transformation = "化科" | "化權" | "化祿" | "化忌";

export interface Star {
  name: string;
  brightness: "bright" | "dim";
  palace: number;
  isTransformed: boolean;
  transformations?: Transformation[];  // A star can have multiple transformations
  selfInfluence?: Transformation[];    // Store which transformations are self-influences
}

/**
 * Represents a single palace in the chart
 */
export interface Palace {
  number: number;  // 1-12
  earthlyBranch: EarthlyBranchType;
  heavenlyStem: HeavenlyStemType;
  name: string;
  mainStar?: Star[];
  bodyStar?: Star;
  transformedStar?: Star;
  minorStars: Star[];
  auxiliaryStars: Star[];
  yearStars: Star[];
  monthStars: Star[];
  dayStars: Star[];
  hourStars: Star[];
  lifeStar?: Star;
  originalPalace: number;
  transformedPalace?: number;
  majorLimit?: {
    startAge: number;
    endAge: number;
  };
  annualFlow?: {
    year: number;
    earthlyBranch: EarthlyBranchType;
    heavenlyStem: HeavenlyStemType;
  };
  oppositePalaceInfluence?: Array<{
    starName: string;
    transformation: Transformation;
    sourcePalace: number;
  }>;
}

/**
 * Input data for chart calculation
 */
export interface ChartInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: "male" | "female";
  name: string;
}

/**
 * Complete chart data structure
 */
export interface ChartData {
  input: ChartInput;
  palaces: Palace[];
  lunarDate: LunarDate;
  lifePalace: number;
  bodyPalace: number;
  originalPalace: number;
  transformedPalace?: number;
  yearBranch: number;
  monthBranch: number;
  dayBranch: number;
  hourBranch: number;
  yearStem: number;
  monthStem: number;
  dayStem: number;
  hourStem: number;
  earthlyBranch: EarthlyBranchType;
  heavenlyStem: HeavenlyStemType;
  yinYang: "Yin" | "Yang";
  fiveElements?: FiveElementType;
  ziWeiPosition?: number;  // Position of the ZiWei star (1-12)
  mainStar?: string;       // Main star in the chart
  transformations?: {
    huaLu: string;         // 化禄 transformation star name
    huaQuan: string;       // 化权 transformation star name
    huaKe: string;         // 化科 transformation star name
    huaJi: string;         // 化忌 transformation star name
  };
  calculationSteps: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step6: string;
    step7: string;
    step8: string;
    step9: string;
    step10: string;
    step11: string;
    step12: string;
    step13: string;
    step14: string;
  };
}

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
}

