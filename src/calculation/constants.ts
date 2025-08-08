/**
 * Constants for Zi Wei Dou Shu calculations
 */

import { ChartData } from "./types";

/**
 * Palace names in Chinese
 */
export const PALACE_NAMES = [
  "命宫",
  "兄弟",
  "夫妻",
  "子女",
  "财帛",
  "疾厄",
  "迁移",
  "交友",
  "官禄",
  "田宅",
  "福德",
  "父母",
] as const;



/**
 * Earthly Branch names in Chinese
 */
export const EARTHLY_BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

/**
 * Heavenly Stem names in Chinese
 */
export const HEAVENLY_STEMS = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
] as const;

/**
 * ZiWei star position lookup table based on lunar day and five elements
 * Format: [lunar_day][five_elements] = earthly branch */
export const ZIWEI_POSITIONS = {
  // First image (top part - days 1-15)
  初一: {
    水二局: "丑",
    木三局: "辰",
    金四局: "亥",
    土五局: "午",
    火六局: "酉",
  },
  初二: {
    水二局: "寅",
    木三局: "丑",
    金四局: "辰",
    土五局: "亥",
    火六局: "午",
  },
  初三: {
    水二局: "寅",
    木三局: "寅",
    金四局: "丑",
    土五局: "辰",
    火六局: "亥",
  },
  初四: {
    水二局: "卯",
    木三局: "巳",
    金四局: "寅",
    土五局: "丑",
    火六局: "辰",
  },
  初五: {
    水二局: "卯",
    木三局: "寅",
    金四局: "子",
    土五局: "寅",
    火六局: "丑",
  },
  初六: {
    水二局: "辰",
    木三局: "卯",
    金四局: "巳",
    土五局: "未",
    火六局: "寅",
  },
  初七: {
    水二局: "辰",
    木三局: "午",
    金四局: "寅",
    土五局: "子",
    火六局: "戌",
  },
  初八: {
    水二局: "巳",
    木三局: "卯",
    金四局: "卯",
    土五局: "巳",
    火六局: "未",
  },
  初九: {
    水二局: "巳",
    木三局: "辰",
    金四局: "丑",
    土五局: "寅",
    火六局: "子",
  },
  初十: {
    水二局: "午",
    木三局: "未",
    金四局: "午",
    土五局: "卯",
    火六局: "巳",
  },
  十一: {
    水二局: "午",
    木三局: "辰",
    金四局: "卯",
    土五局: "申",
    火六局: "寅",
  },
  十二: {
    水二局: "未",
    木三局: "巳",
    金四局: "辰",
    土五局: "丑",
    火六局: "卯",
  },
  十三: {
    水二局: "未",
    木三局: "申",
    金四局: "寅",
    土五局: "午",
    火六局: "亥",
  },
  十四: {
    水二局: "申",
    木三局: "巳",
    金四局: "未",
    土五局: "卯",
    火六局: "申",
  },
  十五: {
    水二局: "申",
    木三局: "午",
    金四局: "辰",
    土五局: "辰",
    火六局: "丑",
  },

  // First image (bottom part - days 16-30)
  十六: {
    水二局: "酉",
    木三局: "酉",
    金四局: "巳",
    土五局: "酉",
    火六局: "午",
  },
  十七: {
    水二局: "酉",
    木三局: "午",
    金四局: "卯",
    土五局: "寅",
    火六局: "卯",
  },
  十八: {
    水二局: "戌",
    木三局: "未",
    金四局: "申",
    土五局: "未",
    火六局: "辰",
  },
  十九: {
    水二局: "戌",
    木三局: "戌",
    金四局: "巳",
    土五局: "辰",
    火六局: "子",
  },
  二十: {
    水二局: "亥",
    木三局: "未",
    金四局: "午",
    土五局: "巳",
    火六局: "酉",
  },
  廿一: {
    水二局: "亥",
    木三局: "申",
    金四局: "辰",
    土五局: "戌",
    火六局: "寅",
  },
  廿二: {
    水二局: "子",
    木三局: "亥",
    金四局: "酉",
    土五局: "卯",
    火六局: "未",
  },
  廿三: {
    水二局: "子",
    木三局: "申",
    金四局: "午",
    土五局: "申",
    火六局: "辰",
  },
  廿四: {
    水二局: "丑",
    木三局: "酉",
    金四局: "未",
    土五局: "巳",
    火六局: "巳",
  },
  廿五: {
    水二局: "丑",
    木三局: "子",
    金四局: "巳",
    土五局: "午",
    火六局: "丑",
  },
  廿六: {
    水二局: "寅",
    木三局: "酉",
    金四局: "戌",
    土五局: "亥",
    火六局: "戌",
  },
  廿七: {
    水二局: "寅",
    木三局: "戌",
    金四局: "未",
    土五局: "辰",
    火六局: "卯",
  },
  廿八: {
    水二局: "卯",
    木三局: "丑",
    金四局: "申",
    土五局: "酉",
    火六局: "申",
  },
  廿九: {
    水二局: "卯",
    木三局: "戌",
    金四局: "午",
    土五局: "午",
    火六局: "巳",
  },
  三十: {
    水二局: "辰",
    木三局: "亥",
    金四局: "亥",
    土五局: "未",
    火六局: "午",
  },
} as const;

/**
 * Fixed star placement patterns based on ZiWei position
 * Each array represents relative positions from ZiWei for:
 * [天机, 太阳, 武曲, 天同, 廉贞]
 */
export const STAR_PATTERNS_FROM_ZIWEI = {
  1: [2, 3, 4, 5, 6], // If ZiWei in palace 1
  2: [3, 4, 5, 6, 7], // If ZiWei in palace 2
  3: [4, 5, 6, 7, 8], // If ZiWei in palace 3
  4: [5, 6, 7, 8, 9], // If ZiWei in palace 4
  5: [6, 7, 8, 9, 10], // If ZiWei in palace 5
  6: [7, 8, 9, 10, 11], // If ZiWei in palace 6
  7: [8, 9, 10, 11, 12], // If ZiWei in palace 7
  8: [9, 10, 11, 12, 1], // If ZiWei in palace 8
  9: [10, 11, 12, 1, 2], // If ZiWei in palace 9
  10: [11, 12, 1, 2, 3], // If ZiWei in palace 10
  11: [12, 1, 2, 3, 4], // If ZiWei in palace 11
  12: [1, 2, 3, 4, 5], // If ZiWei in palace 12
} as const;

/**
 * Fixed positions for 天府 star based on ZiWei position
 */
export const TIANFU_POSITIONS = {
  1: 8, // If ZiWei in palace 1, TianFu starts in palace 8
  2: 9, // If ZiWei in palace 2, TianFu starts in palace 9
  3: 10, // and so on...
  4: 11,
  5: 12,
  6: 1,
  7: 2,
  8: 3,
  9: 4,
  10: 5,
  11: 6,
  12: 7,
} as const;

/**
 * Fixed sequence of stars that follow TianFu
 * These stars are placed in consecutive palaces starting from TianFu's position
 */
export const TIANFU_SEQUENCE = [
  "天府",
  "太阴",
  "贪狼",
  "巨门",
  "天相",
  "天梁",
  "七杀",
  "破军",
] as const;

/**
 * Position lookup table for Left Support (左輔) star
 * Based on birth month only
 */
export const LEFT_SUPPORT_POSITIONS: { [month: number]: string } = {
  1: "辰", // Month 1 corresponds to 寅
  2: "巳", // Month 2 corresponds to 丑
  3: "午", // Month 3 corresponds to 子
  4: "未", // Month 4 corresponds to 亥
  5: "申", // Month 5 corresponds to 戌
  6: "酉", // Month 6 corresponds to 酉
  7: "戌", // Month 7 corresponds to 申
  8: "亥", // Month 8 corresponds to 未
  9: "子", // Month 9 corresponds to 午
  10: "丑", // Month 10 corresponds to 巳
  11: "寅", // Month 11 corresponds to 辰
  12: "卯", // Month 12 corresponds to 卯
};

/**
 * Position lookup table for Right Support (右弼) star
 * Based on birth month only
 */
export const RIGHT_SUPPORT_POSITIONS: { [month: number]: string } = {
  1: "戌", // Month 1 corresponds to 申
  2: "酉", // Month 2 corresponds to 酉
  3: "申", // Month 3 corresponds to 戌
  4: "未", // Month 4 corresponds to 亥
  5: "午", // Month 5 corresponds to 子
  6: "巳", // Month 6 corresponds to 丑
  7: "辰", // Month 7 corresponds to 寅
  8: "卯", // Month 8 corresponds to 卯
  9: "寅", // Month 9 corresponds to 辰
  10: "丑", // Month 10 corresponds to 巳
  11: "子", // Month 11 corresponds to 午
  12: "亥", // Month 12 corresponds to 未
};

/**
 * Position lookup table for Wen Chang (文昌) star
 * Based on birth hour only
 */
export const WEN_CHANG_POSITIONS: { [hour: number]: string } = {
  23: "戌", // 23:00-01:00 corresponds to 寅
  1: "酉", // 01:00-03:00 corresponds to 卯
  3: "申", // 03:00-05:00 corresponds to 辰
  5: "未", // 05:00-07:00 corresponds to 巳
  7: "午", // 07:00-09:00 corresponds to 午
  9: "巳", // 09:00-11:00 corresponds to 未
  11: "辰", // 11:00-13:00 corresponds to 申
  13: "卯", // 13:00-15:00 corresponds to 酉
  15: "寅", // 15:00-17:00 corresponds to 戌
  17: "丑", // 17:00-19:00 corresponds to 亥
  19: "子", // 19:00-21:00 corresponds to 子
  21: "亥", // 21:00-23:00 corresponds to 丑
};

/**
 * Position lookup table for Wen Qu (文曲) star
 * Based on birth hour only
 */
export const WEN_QU_POSITIONS: { [hour: number]: string } = {
  23: "辰", // 23:00-01:00 corresponds to 申
  1: "巳", // 01:00-03:00 corresponds to 酉
  3: "午", // 03:00-05:00 corresponds to 戌
  5: "未", // 05:00-07:00 corresponds to 亥
  7: "申", // 07:00-09:00 corresponds to 子
  9: "酉", // 09:00-11:00 corresponds to 丑
  11: "戌", // 11:00-13:00 corresponds to 寅
  13: "亥", // 13:00-15:00 corresponds to 卯
  15: "子", // 15:00-17:00 corresponds to 辰
  17: "丑", // 17:00-19:00 corresponds to 巳
  19: "寅", // 19:00-21:00 corresponds to 午
  21: "卯", // 21:00-23:00 corresponds to 未
};

/**
 * Four Transformation (四化星) lookup table
 * Based on birth year's Heavenly Stem
 * Each entry maps a Heavenly Stem to which stars receive which transformations
 */
export const FOUR_TRANSFORMATIONS: {
  [stem in (typeof HEAVENLY_STEMS)[number]]: {
    祿: string; // 化祿
    權: string; // 化權
    科: string; // 化科
    忌: string; // 化忌
  };
} = {
  甲: {
    祿: "廉贞", // 化科 goes to 廉贞
    權: "破军", // 化權 goes to 破军
    科: "武曲", // 化祿 goes to 武曲
    忌: "太阳", // 化忌 goes to 太阳
  },
  乙: {
    祿: "天机",
    權: "天梁",
    科: "紫微",
    忌: "太阴",
  },
  丙: {
    祿: "天同",
    權: "天机",
    科: "文昌",
    忌: "廉贞",
  },
  丁: {
    祿: "太阴",
    權: "天同",
    科: "天机",
    忌: "巨门",
  },
  戊: {
    祿: "贪狼",
    權: "太阴",
    科: "右弼",
    忌: "天机",
  },
  己: {
    祿: "武曲",
    權: "贪狼",
    科: "天梁",
    忌: "文曲",
  },
  庚: {
    祿: "太阳",
    權: "武曲",
    科: "太阴",
    忌: "天同",
  },
  辛: {
    祿: "巨门",
    權: "太阳",
    科: "文曲",
    忌: "文昌",
  },
  壬: {
    祿: "天梁",
    權: "紫微",
    科: "左輔",
    忌: "武曲",
  },
  癸: {
    祿: "破军",
    權: "巨门",
    科: "太阴",
    忌: "贪狼",
  },
};

/**
 * Life Palace position lookup table
 * Each row represents a month (1-12)
 * Each column represents an hour branch (子, 丑, 寅, etc.)
 * Values are the resulting Earthly Branch for the Life Palace
 */
export const LIFE_PALACE_TABLE = [
  ["寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰", "卯"], // Month 1
  ["卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰"], // Month 2
  ["辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳"], // Month 3
  ["巳", "辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午"], // Month 4
  ["午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未"], // Month 5
  ["未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申"], // Month 6
  ["申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌", "酉"], // Month 7
  ["酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌"], // Month 8
  ["戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥"], // Month 9
  ["亥", "戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子"], // Month 10
  ["子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑"], // Month 11
  ["丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅"], // Month 12
] as const;

/**
 * Five Elements lookup table based on Heavenly Stem and Earthly Branch
 */
export const FIVE_ELEMENTS_TABLE = {
  甲: {
    子: "金四局",
    寅: "水二局",
    辰: "火六局",
    午: "金四局",
    申: "水二局",
    戌: "火六局",
  },
  乙: {
    丑: "金四局",
    卯: "水二局",
    巳: "火六局",
    未: "金四局",
    酉: "水二局",
    亥: "火六局",
  },
  丙: {
    子: "水二局",
    寅: "火六局",
    辰: "土五局",
    午: "水二局",
    申: "火六局",
    戌: "土五局",
  },
  丁: {
    丑: "水二局",
    卯: "火六局",
    巳: "土五局",
    未: "水二局",
    酉: "火六局",
    亥: "土五局",
  },
  戊: {
    子: "火六局",
    寅: "土五局",
    辰: "木三局",
    午: "火六局",
    申: "土五局",
    戌: "木三局",
  },
  己: {
    丑: "火六局",
    卯: "土五局",
    巳: "木三局",
    未: "火六局",
    酉: "土五局",
    亥: "木三局",
  },
  庚: {
    子: "土五局",
    寅: "木三局",
    辰: "金四局",
    午: "土五局",
    申: "木三局",
    戌: "金四局",
  },
  辛: {
    丑: "土五局",
    卯: "木三局",
    巳: "金四局",
    未: "土五局",
    酉: "木三局",
    亥: "金四局",
  },
  壬: {
    子: "木三局",
    寅: "金四局",
    辰: "水二局",
    午: "木三局",
    申: "金四局",
    戌: "水二局",
  },
  癸: {
    丑: "木三局",
    卯: "金四局",
    巳: "水二局",
    未: "木三局",
    酉: "金四局",
    亥: "水二局",
  },
} as const;

/**
 * Lunar day number to Chinese string mapping
 */
export const LUNAR_DAY_MAP = {
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
  30: "三十",
} as const;

/**
 * Starting ages for Major Limits based on Five Elements
 */
export const MAJOR_LIMIT_STARTING_AGES = {
  水二局: 2,
  木三局: 3,
  金四局: 4,
  土五局: 5,
  火六局: 6,
} as const;

/**
 * Stars that follow ZiWei's pattern
 */
export const ZIWEI_FOLLOWERS = [
  { name: "天机", brightness: "bright" as const },
  { name: "太阳", brightness: "bright" as const },
  { name: "武曲", brightness: "bright" as const },
  { name: "天同", brightness: "bright" as const },
  { name: "廉贞", brightness: "bright" as const },
] as const;

/**
 * Main stars placement based on the grid patterns shown in the images
 * First level key is the earthly branch where ZiWei is located (紫薇在X)
 * Second level keys are the earthly branches of palace positions
 * Values are arrays of star names appearing in that position
 */
export const MAIN_STARS_TABLE = {
  // 紫薇在子 (top-left chart in first image)
  子: {
    子: ["紫微"],
    丑: [],
    寅: ["破军"],
    卯: [],
    辰: ["天府", "廉贞"],
    巳: ["太阴"],
    午: ["贪狼"],
    未: ["巨门", "天同"],
    申: ["天相", "武曲"],
    酉: ["天梁", "太阳"],
    戌: ["七杀"],
    亥: ["天机"],
  },

  // 紫薇在丑 (top-right chart in first image)
  丑: {
    子: ["天机"],
    丑: ["破军", "紫微"],
    寅: [],
    卯: ["天府"],
    辰: ["太阴"],
    巳: ["贪狼", "廉贞"],
    午: ["巨门"],
    未: ["天相"],
    申: ["天梁", "天同"],
    酉: ["七杀", "武曲"],
    戌: ["太阳"],
    亥: [],
  },

  // 紫薇在寅 (middle-left chart in first image)
  寅: {
    子: ["破军"],
    丑: ["天机"],
    寅: ["天府", "紫微"],
    卯: ["太阴"],
    辰: ["贪狼"],
    巳: ["巨门"],
    午: ["天相", "廉贞"],
    未: ["天梁"],
    申: ["七杀"],
    酉: ["天同"],
    戌: ["武曲"],
    亥: ["太阳"],
  },

  // 紫薇在卯 (middle-right chart in first image)
  卯: {
    子: ["太阳"],
    丑: ["天府"],
    寅: ["太阴", "天机"],
    卯: ["贪狼", "紫微"],
    辰: ["巨门"],
    巳: ["天相"],
    午: ["天梁"],
    未: ["七杀", "廉贞"],
    申: [],
    酉: [],
    戌: ["天同"],
    亥: ["破军", "武曲"],
  },

  // 紫薇在辰 (bottom-left chart in first image)
  辰: {
    子: ["天府", "武曲"],
    丑: ["太阴", "太阳"],
    寅: ["贪狼"],
    卯: ["巨门", "天机"],
    辰: ["天相", "紫微"],
    巳: ["天梁"],
    午: ["七杀"],
    未: [],
    申: ["廉贞"],
    酉: [],
    戌: ["破军"],
    亥: ["天同"],
  },

  // 紫薇在巳 (bottom-right chart in first image)
  巳: {
    子: ["太阴", "天同"],
    丑: ["贪狼", "武曲"],
    寅: ["巨门", "太阳"],
    卯: ["天相"],
    辰: ["天梁", "天机"],
    巳: ["七杀", "紫微"],
    午: [],
    未: [],
    申: [],
    酉: ["破军", "廉贞"],
    戌: [],
    亥: ["天府"],
  },

  // 紫薇在午 (top-left chart in second image)
  午: {
    子: ["贪狼"],
    丑: ["巨门", "天同"],
    寅: ["天相", "武曲"],
    卯: ["天梁", "太阳"],
    辰: ["七杀"],
    巳: ["天机"],
    午: ["紫微"],
    未: [],
    申: ["破军"],
    酉: [],
    戌: ["天府", "廉贞"],
    亥: ["太阴"],
  },

  // 紫薇在未 (top-right chart in second image)
  未: {
    子: ["巨门"],
    丑: ["天相"],
    寅: ["天梁", "天同"],
    卯: ["七杀", "武曲"],
    辰: ["太阳"],
    巳: [],
    午: ["天机"],
    未: ["破军", "紫微"],
    申: [],
    酉: ["天府"],
    戌: ["太阴"],
    亥: ["贪狼", "廉贞"],
  },

  // 紫薇在戌 (bottom-left chart in second image)
  戌: {
    子: ["七杀"],
    丑: [],
    寅: ["廉贞"],
    卯: [],
    辰: ["破军"],
    巳: ["天同"],
    午: ["天府", "武曲"],
    未: ["太阴", "太阳"],
    申: ["贪狼"],
    酉: ["巨门", "天机"],
    戌: ["天相", "紫微"],
    亥: ["天梁"],
  },

  // 紫薇在亥 (bottom-right chart in second image)
  亥: {
    子: [],
    丑: [],
    寅: [],
    卯: ["破军", "廉贞"],
    辰: [],
    巳: ["天府"],
    午: ["太阴", "天同"],
    未: ["贪狼", "武曲"],
    申: ["巨门", "太阳"],
    酉: ["天相"],
    戌: ["天梁", "天机"],
    亥: ["七杀", "紫微"],
  },

  // 紫薇在申 (middle-left chart in second image)
  申: {
    子: ["天相", "廉贞"],
    丑: ["天梁"],
    寅: ["七杀"],
    卯: ["天同"],
    辰: ["武曲"],
    巳: ["太阳"],
    午: ["破军"],
    未: ["天机"],
    申: ["天府", "紫微"],
    酉: ["太阴"],
    戌: ["贪狼"],
    亥: ["巨门"],
  },

  // 紫薇在酉 (middle-right chart in second image)
  酉: {
    子: ["天梁"],
    丑: ["七杀", "廉贞"],
    寅: [],
    卯: [],
    辰: ["天同"],
    巳: ["破军", "武曲"],
    午: ["太阳"],
    未: ["天府"],
    申: ["太阴", "天机"],
    酉: ["贪狼", "紫微"],
    戌: ["巨门"],
    亥: ["天相"],
  },
} as const;

export const OPPOSITE_PALACE_INFLUENCE = {
  命宫: "迁移",
  迁移: "命宫",
  父母: "疾厄",
  疾厄: "父母",
  福德: "财帛",
  财帛: "福德",
  田宅: "子女",
  子女: "田宅",
  官禄: "夫妻",
  夫妻: "官禄",
  交友: "兄弟",
  兄弟: "交友",
} as const;

export const ZIWEI_2025_READING = {
  input: {
    year: 1999,
    month: 12,
    day: 14,
    hour: 9,
    gender: "male",
    name: "Stanley Testing",
  },
  lunarDate: {
    year: 1999,
    month: 12,
    day: 14,
    isLeap: false
  },
  earthlyBranch: "卯",
  heavenlyStem: "己",
  yinYang: "Yin",
  palaces: [
    {
      number: 1,
      earthlyBranch: "巳",
      heavenlyStem: "辛",
      name: "命宮",
      minorStars: [],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 1,
      mainStar: [
        {
          name: "天梁",
          brightness: "bright",
          palace: 1,
          isTransformed: false,
          transformations: ["化權"],
        },
      ],
      majorLimit: {
        startAge: 4,
        endAge: 13,
      },
      annualFlow: {
        year: 2025,
        heavenlyStem: "乙",
        earthlyBranch: "申",
      },
    },
    {
      number: 2,
      earthlyBranch: "午",
      heavenlyStem: "壬",
      name: "父母",
      minorStars: [],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 2,
      mainStar: [
        {
          name: "七殺",
          brightness: "bright",
          palace: 2,
          isTransformed: false,
        },
      ],
      majorLimit: {
        startAge: 114,
        endAge: 123,
      },
      annualFlow: {
        year: 2026,
        heavenlyStem: "丙",
        earthlyBranch: "酉",
      },
    },
    {
      number: 3,
      earthlyBranch: "未",
      heavenlyStem: "癸",
      name: "福德",
      minorStars: [],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 3,
      mainStar: [],
      majorLimit: {
        startAge: 104,
        endAge: 113,
      },
      annualFlow: {
        year: 2027,
        heavenlyStem: "丁",
        earthlyBranch: "戌",
      },
    },
    {
      number: 4,
      earthlyBranch: "申",
      heavenlyStem: "甲",
      name: "田宅",
      minorStars: [],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 4,
      mainStar: [
        {
          name: "廉贞",
          brightness: "bright",
          palace: 4,
          isTransformed: false,
        },
      ],
      majorLimit: {
        startAge: 94,
        endAge: 103,
      },
      annualFlow: {
        year: 2028,
        heavenlyStem: "戊",
        earthlyBranch: "亥",
      },
    },
    {
      number: 5,
      earthlyBranch: "酉",
      heavenlyStem: "乙",
      name: "官禄",
      minorStars: [],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 5,
      mainStar: [],
      majorLimit: {
        startAge: 84,
        endAge: 93,
      },
      annualFlow: {
        year: 2029,
        heavenlyStem: "己",
        earthlyBranch: "子",
      },
    },
    {
      number: 6,
      earthlyBranch: "戌",
      heavenlyStem: "丙",
      name: "交友",
      minorStars: [
        {
          name: "右弼",
          brightness: "bright",
          palace: 6,
          isTransformed: false,
        },
      ],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 6,
      mainStar: [
        {
          name: "破军",
          brightness: "bright",
          palace: 6,
          isTransformed: false,
        },
      ],
      majorLimit: {
        startAge: 74,
        endAge: 83,
      },
      annualFlow: {
        year: 2030,
        heavenlyStem: "庚",
        earthlyBranch: "丑",
      },
    },
    {
      number: 7,
      earthlyBranch: "亥",
      heavenlyStem: "丁",
      name: "遷移",
      minorStars: [
        {
          name: "天同 <span className='text-blue-500 dark:text-blue-300'>\u21BB</span>",
          brightness: "bright",
          palace: 7,
          isTransformed: false,
        },
      ],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 7,
      mainStar: [],
      majorLimit: {
        startAge: 64,
        endAge: 73,
      },
      annualFlow: {
        year: 2031,
        heavenlyStem: "辛",
        earthlyBranch: "寅",
      },
    },
    {
      number: 8,
      earthlyBranch: "子",
      heavenlyStem: "戊",
      name: "疾厄",
      minorStars: [],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 8,
      mainStar: [
        {
          name: "武曲",
          brightness: "bright",
          palace: 8,
          isTransformed: false,
        },
        {
          name: "天府",
          brightness: "bright",
          palace: 8,
          isTransformed: false,
        },
      ],
      majorLimit: {
        startAge: 54,
        endAge: 63,
      },
      annualFlow: {
        year: 2032,
        heavenlyStem: "壬",
        earthlyBranch: "卯",
      },
    },
    {
      number: 9,
      earthlyBranch: "丑",
      heavenlyStem: "己",
      name: "財帛",
      minorStars: [
        {
          name: "文昌",
          brightness: "bright",
          palace: 9,
          isTransformed: false,
        },
        {
          name: "文曲 <span className='text-red-500 dark:text-red-300'>\u21BB</span>",
          brightness: "bright",
          palace: 9,
          isTransformed: false,
        },
      ],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 9,
      mainStar: [
        {
          name: "太阴",
          brightness: "bright",
          palace: 9,
          isTransformed: false,
          transformations: ["化忌"],
        },
        {
          name: "太阳",
          brightness: "bright",
          palace: 9,
          isTransformed: false,
        },
      ],
      majorLimit: {
        startAge: 44,
        endAge: 53,
      },
      annualFlow: {
        year: 2033,
        heavenlyStem: "癸",
        earthlyBranch: "辰",
      },
    },
    {
      number: 10,
      earthlyBranch: "寅",
      heavenlyStem: "戊",
      name: "子女",
      minorStars: [],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 10,
      mainStar: [
        {
          name: "贪狼 <span className='text-green-500 dark:text-green-300'>\u21BB</span>",
          brightness: "bright",
          palace: 10,
          isTransformed: false,
        },
      ],
      majorLimit: {
        startAge: 34,
        endAge: 43,
      },
      annualFlow: {
        year: 2034,
        heavenlyStem: "甲",
        earthlyBranch: "巳",
      },
    },
    {
      number: 11,
      earthlyBranch: "卯",
      heavenlyStem: "己",
      name: "夫妻",
      minorStars: [],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 11,
      mainStar: [
        {
          name: "巨门",
          brightness: "bright",
          palace: 11,
          isTransformed: false,
        },
        {
          name: "天机",
          brightness: "bright",
          palace: 11,
          isTransformed: false,
          transformations: ["化禄"],
        },
      ],
      majorLimit: {
        startAge: 24,
        endAge: 33,
      },
      annualFlow: {
        year: 2035,
        heavenlyStem: "乙",
        earthlyBranch: "午",
      },
    },
    {
      number: 12,
      earthlyBranch: "辰",
      heavenlyStem: "庚",
      name: "兄弟",
      minorStars: [
        {
          name: "左輔",
          brightness: "bright",
          palace: 12,
          isTransformed: false,
        },
      ],
      auxiliaryStars: [],
      yearStars: [],
      monthStars: [],
      dayStars: [],
      hourStars: [],
      originalPalace: 12,
      mainStar: [
        {
          name: "天相",
          brightness: "bright",
          palace: 12,
          isTransformed: false,
        },
        {
          name: "紫微",
          brightness: "bright",
          palace: 12,
          isTransformed: false,
          transformations: ["化科"],
        },
      ],
      majorLimit: {
        startAge: 14,
        endAge: 23,
      },
      annualFlow: {
        year: 2036,
        heavenlyStem: "丙",
        earthlyBranch: "未",
      },
    },
  ],
  lifePalace: 4,
  bodyPalace: 0,
  originalPalace: 0,
  yearBranch: 0,
  monthBranch: 0,
  dayBranch: 0,
  hourBranch: 0,
  yearStem: 0,
  monthStem: 0,
  dayStem: 0,
  hourStem: 0,
  calculationSteps: {
    step1:
      "Earthly Branch and Heavenly Stem calculatedYear: 76, Year Branch: 4, Year Stem: 6Earthly Branch: 卯, Heavenly Stem: 己",
    step2: "",
    step3:
      "Heavenly Stems assigned to each palace starting from Palace 10 with 丙",
    step4:
      "Life Palace calculation: Month 12 (row), Hour Branch 巳 (column), Found earthly branch 申, mapped to palace position 4",
    step5: "Palace names populated starting from Life Palace at position 4",
    step6:
      "Five Elements calculation: Life Palace (命宫) at position 4 with Heavenly Stem 壬 and Earthly Branch 申 = 金四局",
    step7: "ZiWei star placed in earthly branch 寅, palace position 10",
    step8: "All main stars placed based on ZiWei's position in palace 10",
    step9:
      "Support stars placed: 左輔 in 卯 (palace 11) and 右弼 in 亥 (palace 7) based on month 12, 文昌 in 巳 (palace 1) and 文曲 in 酉 (palace 5) based on hour 9",
    step10:
      "Four Transformations based on birth year's Heavenly Stem 己:\n化科 -> 天梁 in palace 3\n化權 -> 贪狼 in palace 12\n化祿 -> 武曲 in palace 6\n化忌 -> 文曲 in palace 5",
    step11:
      "Major Limits calculated starting from age 4 (金四局), starting at Life Palace 4, moving counter-clockwise for male with Yin polarity",
    step12:
      "Annual Flow calculated for current year 2025. Current year is in palace 1. Base cycle: 2013-2024, repeating every 12 years.",
    step13:
      "Self Influence (自化) calculated for all stars based on their palace's Heavenly Stem",
    step14:
      "Opposite Palace Influence calculated for all palaces based on opposite palace stars and current palace Heavenly Stem",
  },
  fiveElements: "金四局",
  ziWeiPosition: 10,
  transformations: {
    huaLu: "武曲",
    huaQuan: "贪狼",
    huaKe: "天梁",
    huaJi: "文曲",
  },
  mainStar: "七杀",
} as ChartData;
