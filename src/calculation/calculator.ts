import {
  ChartInput,
  ChartData,
  Star,
  FiveElementType,
  Transformation,
  EarthlyBranchType,
  HeavenlyStemType,
} from "./types";
import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  PALACE_NAMES,
  ZIWEI_POSITIONS,
  LEFT_SUPPORT_POSITIONS,
  RIGHT_SUPPORT_POSITIONS,
  WEN_CHANG_POSITIONS,
  WEN_QU_POSITIONS,
  FOUR_TRANSFORMATIONS,
  LIFE_PALACE_TABLE,
  FIVE_ELEMENTS_TABLE,
  MAJOR_LIMIT_STARTING_AGES,
  MAIN_STARS_TABLE,
  OPPOSITE_PALACE_INFLUENCE,
} from "./constants";
import {
  getHourBranch,
  findStarByName,
  getLunarDayFromBirthday,
} from "./utils";
import { lunar } from "./lunar";

/**
 * Cache for palace template to avoid repeated object creation
 */
const PALACE_TEMPLATE = Array.from({ length: 12 }, (_, i) => {
  const palaceNumber = i + 1;
  return {
    number: palaceNumber,
    earthlyBranch: EARTHLY_BRANCHES[(i + 5) % 12],
    heavenlyStem: HEAVENLY_STEMS[0],
    name: PALACE_NAMES[i],
    minorStars: [],
    auxiliaryStars: [],
    yearStars: [],
    monthStars: [],
    dayStars: [],
    hourStars: [],
    originalPalace: palaceNumber,
  };
});

/**
 * Star index for fast lookups
 */
interface StarIndex {
  [starName: string]: { star: Star; palace: number; starType: string };
}

/**
 * Main calculator class for Zi Wei Dou Shu chart calculations
 */
export class ZWDSCalculator {
  private readonly input: ChartInput;
  private readonly chartData: ChartData;
  private starIndex: StarIndex = {};

  constructor(input: ChartInput) {
    this.input = input;
    this.chartData = this.initializeChartData();
  }

  // Chart Palace Grid Display Structure
  // [1] [2] [3] [4]
  // [12] [INFO] [INFO] [5]
  // [11] [INFO] [INFO] [6]
  // [10] [9] [8] [7]
  // INFO: Basic Information of the user (Name, Gender, Birth Date, Birth Time) + Stuff that is not in the palace

  /**
   * Initialize the chart data structure with optimized object creation
   */
  private initializeChartData(): ChartData {
    // Deep clone the palace template to avoid shared references
    const palaces = PALACE_TEMPLATE.map(palace => ({
      ...palace,
      earthlyBranch: palace.earthlyBranch as EarthlyBranchType,
      heavenlyStem: palace.heavenlyStem as HeavenlyStemType,
      name: palace.name as string,
      minorStars: [] as Star[],
      auxiliaryStars: [] as Star[],
      yearStars: [] as Star[],
      monthStars: [] as Star[],
      dayStars: [] as Star[],
      hourStars: [] as Star[],
    }));

    return {
      input: this.input,
      earthlyBranch: EARTHLY_BRANCHES[0],
      heavenlyStem: HEAVENLY_STEMS[0],
      yinYang: "Yang",
      lunarDate: {
        year: 0,
        month: 0,
        day: 0,
        isLeap: false,
      },
      palaces,
      lifePalace: 0,
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
        step1: "",
        step2: "",
        step3: "",
        step4: "",
        step5: "",
        step6: "",
        step7: "",
        step8: "",
        step9: "",
        step10: "",
        step11: "",
        step12: "",
        step13: "",
        step14: "",
      },
    };
  }

  /**
   * Build star index for fast lookups - called after stars are placed
   */
  private buildStarIndex(): void {
    this.starIndex = {};
    
    this.chartData.palaces.forEach((palace, palaceIndex) => {
      const palaceNumber = palaceIndex + 1;
      
      // Index all star types
      const starArrays = [
        { stars: palace.mainStar, type: 'mainStar' },
        { stars: palace.bodyStar ? [palace.bodyStar] : [], type: 'bodyStar' },
        { stars: palace.lifeStar ? [palace.lifeStar] : [], type: 'lifeStar' },
        { stars: palace.minorStars, type: 'minorStars' },
        { stars: palace.auxiliaryStars, type: 'auxiliaryStars' },
        { stars: palace.yearStars, type: 'yearStars' },
        { stars: palace.monthStars, type: 'monthStars' },
        { stars: palace.dayStars, type: 'dayStars' },
        { stars: palace.hourStars, type: 'hourStars' },
      ];

      starArrays.forEach(({ stars, type }) => {
        if (Array.isArray(stars)) {
          stars.forEach(star => {
            this.starIndex[star.name] = {
              star,
              palace: palaceNumber,
              starType: type
            };
          });
        }
      });
    });
  }



  /**
   * Calculate the complete chart with optimizations
   */
  public calculate(): ChartData {
    this.step1();
    this.step2();
    this.step3();
    this.step4();
    this.step5();
    this.step6();
    this.step7();
    this.step8();
    this.step9();
    this.step10();
    
    // Build star index after all stars are placed for fast lookups
    this.buildStarIndex();
    
    this.step11();
    this.step12();
    
    // Combine steps 13, 14, and transformation detection into one optimized loop
    this.optimizedFinalSteps();

    return this.formatFinalResult();
  }

  /**
   * Optimized final steps - combines steps 13, 14, and transformation detection
   */
  private optimizedFinalSteps(): void {
    // Track transformations for final result
    const transformations = {
      huaLu: "",
      huaQuan: "",
      huaKe: "",
      huaJi: "",
    };

    // Single loop through all palaces for steps 13, 14, and transformation detection
    this.chartData.palaces.forEach((palace) => {
      const heavenlyStem = palace.heavenlyStem;
      const palaceName = palace.name;

      // Get transformation rules for this palace's heavenly stem
      const transformationRules = FOUR_TRANSFORMATIONS[heavenlyStem];
      
      if (transformationRules) {
        // Create transformation map for faster lookup
        const transformationMap = new Map([
          ["化科", transformationRules.科],
          ["化權", transformationRules.權],
          ["化祿", transformationRules.祿],
          ["化忌", transformationRules.忌],
        ]);

        // Get opposite palace for step 14
        const oppositePalaceName = OPPOSITE_PALACE_INFLUENCE[palaceName as keyof typeof OPPOSITE_PALACE_INFLUENCE];
        const oppositePalace = oppositePalaceName 
          ? this.chartData.palaces.find(p => p.name === oppositePalaceName)
          : null;

        // Process all stars in current palace
        this.processStarsOptimized(palace, transformationMap, transformations);

        // Process opposite palace stars for step 14
        if (oppositePalace) {
          this.processOppositePalaceStars(palace, oppositePalace, transformationMap);
        }
      }
    });

    // Store final transformations
    this.chartData.transformations = transformations;

    // Record calculation steps
    this.chartData.calculationSteps.step13 = "Self Influence (自化) calculated optimally";
    this.chartData.calculationSteps.step14 = "Opposite Palace Influence calculated optimally";
  }

  /**
   * Process stars for self-influence and transformation detection
   */
  private processStarsOptimized(
    palace: any, 
    transformationMap: Map<string, string>,
    transformations: any
  ): void {
    const starArrays = [
      palace.mainStar,
      palace.bodyStar ? [palace.bodyStar] : [],
      palace.lifeStar ? [palace.lifeStar] : [],
      palace.minorStars,
      palace.auxiliaryStars,
      palace.yearStars,
      palace.monthStars,
      palace.dayStars,
      palace.hourStars,
    ].filter(Boolean);

    starArrays.forEach(stars => {
      if (Array.isArray(stars)) {
        stars.forEach(star => {
          // Check for self-influence (step 13) and transformations in one pass
          transformationMap.forEach((starName, transformationType) => {
            if (star.name === starName) {
              // Add self-influence
              if (!star.selfInfluence) star.selfInfluence = [];
              star.selfInfluence.push(transformationType as Transformation);

              // Track transformations for final result
              switch (transformationType) {
                case "化祿":
                  transformations.huaLu = star.name;
                  break;
                case "化權":
                  transformations.huaQuan = star.name;
                  break;
                case "化科":
                  transformations.huaKe = star.name;
                  break;
                case "化忌":
                  transformations.huaJi = star.name;
                  break;
              }
            }
          });
        });
      }
    });
  }

  /**
   * Process opposite palace stars for influence detection
   */
  private processOppositePalaceStars(
    currentPalace: any,
    oppositePalace: any, 
    transformationMap: Map<string, string>
  ): void {
    const starArrays = [
      oppositePalace.mainStar,
      oppositePalace.bodyStar ? [oppositePalace.bodyStar] : [],
      oppositePalace.lifeStar ? [oppositePalace.lifeStar] : [],
      oppositePalace.minorStars,
      oppositePalace.auxiliaryStars,
      oppositePalace.yearStars,
      oppositePalace.monthStars,
      oppositePalace.dayStars,
      oppositePalace.hourStars,
    ].filter(Boolean);

    starArrays.forEach(stars => {
      if (Array.isArray(stars)) {
        stars.forEach(star => {
          transformationMap.forEach((starName, transformationType) => {
            if (star.name === starName) {
              if (!currentPalace.oppositePalaceInfluence) {
                currentPalace.oppositePalaceInfluence = [];
              }
              
              currentPalace.oppositePalaceInfluence.push({
                starName: star.name,
                transformation: transformationType as Transformation,
                sourcePalace: oppositePalace.number,
              });
            }
          });
        });
      }
    });
  }

  /**
   * Format final result with main star extraction
   */
  private formatFinalResult(): ChartData {
    // Extract main star efficiently
    let mainStar = "";
    const lifePalace = this.chartData.palaces[this.chartData.lifePalace - 1];
    if (lifePalace?.mainStar && lifePalace.mainStar.length > 0) {
      mainStar = lifePalace.mainStar[0]?.name || "";
    }

    return {
      ...this.chartData,
      mainStar,
    };
  }

  /**
   * Step 1: Calculate Earthly Branch and Heavenly Stem
   */
  private step1(): void {
    // Calculates Earthly Branch and Heavenly Stem for the year
    // DONE THIS IS CORRECT ALREADY
    const lunarDate = lunar.convertSolarToLunar(
      this.input.year,
      this.input.month,
      this.input.day
    );

    const year = lunarDate.year - 1900 - 23;
    // const year = this.input.year;
    const yearBranch = year % 12;
    const yearStem = year % 10;

    // Fix index calculation to handle when yearBranch or yearStem is 0
    // Use modulo to ensure we wrap around to the end of the arrays
    this.chartData.earthlyBranch = EARTHLY_BRANCHES[(yearBranch - 1 + 12) % 12] as EarthlyBranchType;
    this.chartData.heavenlyStem = HEAVENLY_STEMS[(yearStem - 1 + 10) % 10] as HeavenlyStemType;

    // Record the calculation step
    this.chartData.calculationSteps.step1 = `Earthly Branch and Heavenly Stem calculated`;
    this.chartData.calculationSteps.step1 += `Year: ${year}, Year Branch: ${yearBranch}, Year Stem: ${yearStem}`;
    this.chartData.calculationSteps.step1 += `Earthly Branch: ${this.chartData.earthlyBranch}, Heavenly Stem: ${this.chartData.heavenlyStem}`;
  }

  /**
   * Step 2: Calculate Yin Yang
   */
  private step2(): void {
    // Calculates Yin Yang for the year

    // Convert to lunar first
    const lunarDate = lunar.convertSolarToLunar(
      this.input.year,
      this.input.month,
      this.input.day
    );
    const year = lunarDate.year;
    const yearStem = year % 10;

    this.chartData.yinYang = yearStem % 2 === 1 ? "Yin" : "Yang";
  }

  /**
   * Step 3: Calculate the Position of Heavenly Stem in each palace
   */
  private step3(): void {
    // DONE THIS IS CORRECT ALREADY

    const heavenlyStem = this.chartData.heavenlyStem;

    // Get the index of the user's Heavenly Stem
    const heavenlyStemIndex = HEAVENLY_STEMS.indexOf(heavenlyStem);

    if (heavenlyStemIndex === -1) {
      throw new Error(`Invalid Heavenly Stem: ${heavenlyStem}`);
    }

    // Determine the starting Heavenly Stem for Palace 10 based on user's Heavenly Stem
    let palace10StemIndex;

    // Pattern based on stem index modulo 5
    const stemGroup = heavenlyStemIndex % 5;

    if (stemGroup === 0) {
      // 甲(0)/己(5)
      palace10StemIndex = 2;
    } else if (stemGroup === 1) {
      // 乙(1)/庚(6)
      palace10StemIndex = 4;
    } else if (stemGroup === 2) {
      // 丙(2)/辛(7)
      palace10StemIndex = 6;
    } else if (stemGroup === 3) {
      // 丁(3)/壬(8)
      palace10StemIndex = 8;
    } else if (stemGroup === 4) {
      // 戊(4)/癸(9)
      palace10StemIndex = 0;
    } else {
      throw new Error(`Unexpected stem group: ${stemGroup}`);
    }

    // Assign Heavenly Stems to each palace, starting from Palace 10 and going clockwise
    for (let i = 0; i < 12; i++) {
      // Palace order: 10, 11, 12, 1, 2, ..., 9
      const palaceIndex = (9 + i) % 12;

      // Calculate the Heavenly Stem index for this palace
      const stemIndex = (palace10StemIndex + i) % 10;

      // Assign the Heavenly Stem to this palace
      const palace = this.chartData.palaces[palaceIndex];
      if (palace) {
        palace.heavenlyStem = HEAVENLY_STEMS[stemIndex] as HeavenlyStemType;
      }
    }

    // Record the calculation step
    this.chartData.calculationSteps.step3 = `Heavenly Stems assigned to each palace starting from Palace 10 with ${HEAVENLY_STEMS[palace10StemIndex]}`;
  }

  /**
   * Step 4: Calculate the position of the Life Palace (命宫)
   * Based on the intersection of birth month (rows) and birth hour/earthly branch (columns)
   */
  private step4(): void {
    // DONE THIS IS CORRECT ALREADY

    const { year, month, day, hour } = this.input;

    // Convert solar date to lunar date
    // We need to import the lunar utility at the top of the file to use this
    const lunarDate = lunar.convertSolarToLunar(year, month, day);
    const lunarMonth = lunarDate.month;

    // Convert hour to Earthly Branch position (0-11)
    const hourBranch = getHourBranch(hour);
    const hourBranchName = EARTHLY_BRANCHES[hourBranch];

    // Store the lunar date in the chart data
    this.chartData.lunarDate = {
      year: lunarDate.year,
      month: lunarDate.month,
      day: lunarDate.day,
      isLeap: lunarDate.isLeap,
    };

    // LIFE_PALACE_TABLE is organized as:
    // [month-1][hourBranch] = earthly branch name for life palace
    // We need to subtract 1 from lunarMonth because arrays are 0-indexed
    const lifePalaceEarthlyBranch =
      LIFE_PALACE_TABLE[lunarMonth - 1]?.[hourBranch];


    if (!lifePalaceEarthlyBranch) {
      console.error(
        "Invalid Life Palace earthly branch:",
        lifePalaceEarthlyBranch
      );
      console.error("Lunar Month:", lunarMonth, "Hour Branch:", hourBranch);
      throw new Error(
        `Invalid Life Palace earthly branch: ${lifePalaceEarthlyBranch} for lunar month ${lunarMonth} and hour branch ${hourBranch}`
      );
    }

    let lifePalace = 0;
    for (let i = 0; i < this.chartData.palaces.length; i++) {
      if (this.chartData.palaces[i]?.earthlyBranch === lifePalaceEarthlyBranch) {
        lifePalace = i + 1;
        break;
      }
    }

    if (lifePalace < 1 || lifePalace > 12) {
      console.error(
        "Could not find palace with earthly branch:",
        lifePalaceEarthlyBranch
      );
      throw new Error(
        `Could not find palace with earthly branch: ${lifePalaceEarthlyBranch}`
      );
    }

    // Set the Life Palace position
    this.chartData.lifePalace = lifePalace;

    // Record the calculation step
    this.chartData.calculationSteps.step4 =
      `Life Palace calculation: Lunar Month ${lunarMonth} (row), ` +
      `Hour Branch ${hourBranchName} (column), ` +
      `Found earthly branch ${lifePalaceEarthlyBranch}, ` +
      `mapped to palace position ${lifePalace}`;
  }

  /**
   * Step 5: Populate all palace names in the correct order
   * Starting from Life Palace (命宫), going counterclockwise:
   * 命宫 -> 兄弟 -> 夫妻 -> 子女 -> 财帛 -> 疾厄 ->
   * 迁移 -> 仆役 -> 官禄 -> 田宅 -> 福德 -> 父母
   */
  private step5(): void {
    // DONE THIS IS CORRECT ALREADY
    const lifePalace = this.chartData.lifePalace;

    // Populate palace names starting from Life Palace position
    for (let i = 0; i < 12; i++) {
      // Calculate the actual palace position (1-12) for each name
      // We subtract 1 from lifePalace because array is 0-based
      // We use modulo 12 to wrap around when we exceed 12
      const palacePosition = (lifePalace - 1 - i + 12) % 12;

      // Set the palace name
      if (this.chartData.palaces[palacePosition]) {
        this.chartData.palaces[palacePosition].name = PALACE_NAMES[i] as string;
      }
    }

    // Record the calculation step
    this.chartData.calculationSteps.step5 = `Palace names populated starting from Life Palace at position ${lifePalace}`;
  }

  /**
   * Step 6: Calculate the Five Elements (五行局)
   * Based on the Life Palace's Heavenly Stem and Earthly Branch
   */
  private step6(): void {
    // DONE THIS IS CORRECT ALREADY

    // Get the Life Palace position
    const lifePalacePos = this.chartData.lifePalace - 1; // Convert to 0-based index
    const lifePalace = this.chartData.palaces[lifePalacePos];

    if (!lifePalace) {
      throw new Error(`Invalid life palace position: ${this.chartData.lifePalace}`);
    }

    // Get the Heavenly Stem and Earthly Branch of the Life Palace
    const heavenlyStem = lifePalace.heavenlyStem;
    const earthlyBranch = lifePalace.earthlyBranch;

    // Get the Five Elements type
    const fiveElements = (
      FIVE_ELEMENTS_TABLE[heavenlyStem] as Record<string, string>
    )[earthlyBranch];

    // Store the result
    this.chartData.fiveElements = fiveElements as FiveElementType;

    // Record the calculation step with detailed information
    this.chartData.calculationSteps.step6 =
      `Five Elements calculation: Life Palace (${lifePalace.name}) at position ${this.chartData.lifePalace} ` +
      `with Heavenly Stem ${heavenlyStem} and Earthly Branch ${earthlyBranch} = ${fiveElements}`;
  }

  /**
   * Step 7: Find the position of ZiWei star based on lunar day and Five Elements
   * This serves as an anchor point for placing other stars
   */
  private step7(): void {
    const fiveElements = this.chartData.fiveElements;

    if (!fiveElements) {
      throw new Error(
        "Five Elements must be calculated before placing ZiWei star"
      );
    }

    // Convert day number to lunar day string
    const lunarDay = getLunarDayFromBirthday(
      this.input.year,
      this.input.month,
      this.input.day
    );

    // Get ZiWei earthly branch from lookup table
    const ziWeiEarthlyBranch =
      ZIWEI_POSITIONS[lunarDay as keyof typeof ZIWEI_POSITIONS]?.[
        fiveElements as keyof (typeof ZIWEI_POSITIONS)[keyof typeof ZIWEI_POSITIONS]
      ];

    if (!ziWeiEarthlyBranch) {
      throw new Error(
        `Invalid lunar day or five elements: ${String(
          lunarDay
        )}, ${fiveElements}`
      );
    }

    // Find which palace has the ZiWei star based on its earthly branch
    let ziWeiPosition = 0;
    for (let i = 0; i < this.chartData.palaces.length; i++) {
      const palace = this.chartData.palaces[i];
      if (palace?.earthlyBranch === ziWeiEarthlyBranch) {
        ziWeiPosition = i + 1; // Found ZiWei's palace position (1-12)

        // Initialize mainStar as an array and place the ZiWei star in this palace
        palace.mainStar = [
          {
            name: "紫微",
            brightness: "bright",
            palace: ziWeiPosition,
            isTransformed: false,
          },
        ];
        break;
      }
    }

    if (ziWeiPosition === 0) {
      throw new Error(
        `Could not find palace with earthly branch ${ziWeiEarthlyBranch} for ZiWei star`
      );
    }

    // Set the ZiWei position in the chart data
    this.chartData.ziWeiPosition = ziWeiPosition;

    // Record the calculation step
    this.chartData.calculationSteps.step7 = `ZiWei star placed in earthly branch ${ziWeiEarthlyBranch}, palace position ${this.chartData.ziWeiPosition}`;
  }

  /**
   * Step 8: Place the remaining main stars based on ZiWei's position
   */
  private step8(): void {
    // DONE THIS IS CORRECT ALREADY
    const ziWeiPosition = this.chartData.ziWeiPosition;

    if (!ziWeiPosition) {
      throw new Error(
        "ZiWei position must be calculated before placing other stars"
      );
    }

    // Populate the other main stars based on ZiWei's position
    const ziWeiPalace = this.chartData.palaces[ziWeiPosition - 1];
    if (!ziWeiPalace) {
      throw new Error(`Invalid ZiWei position: ${ziWeiPosition}`);
    }
    
    const earthlyBranch = ziWeiPalace.earthlyBranch;
    const mainStars = MAIN_STARS_TABLE[earthlyBranch];

    // Initialize mainStar arrays for all palaces if not already initialized
    for (let i = 0; i < this.chartData.palaces.length; i++) {
      const palace = this.chartData.palaces[i];
      if (palace) {
        palace.mainStar = palace.mainStar || [];
      }
    }

    // Populate main stars for each palace
    for (let i = 0; i < this.chartData.palaces.length; i++) {
      const palace = this.chartData.palaces[i];
      if (!palace) continue;
      
      const stars = mainStars[palace.earthlyBranch] as readonly string[];

      if (!stars || stars.length === 0) {
        continue;
      }

      for (let j = 0; j < stars.length; j++) {
        // Skip if star is ZiWei and we're in the ZiWei palace (already placed in step7)
        if (stars[j] === "紫微" && i === ziWeiPosition - 1) {
          continue;
        }

        if (palace.mainStar) {
          palace.mainStar.push({
            name: stars[j] as string,
            brightness: "bright",
            palace: i + 1,
            isTransformed: false,
          });
        }
      }
    }

    // Record the calculation step
    this.chartData.calculationSteps.step8 = `All main stars placed based on ZiWei's position in palace ${ziWeiPosition}`;
  }

  /**
   * Step 9: Calculate positions of all four supporting stars:
   * Left Support (左輔) and Right Support (右弼) based on birth month
   * Wen Chang (文昌) and Wen Qu (文曲) based on birth hour
   */
  private step9(): void {
    // DONE THIS IS CORRECT ALREADY
    const { year, month, day, hour } = this.input;

    // Convert solar date to lunar date
    const lunarDate = lunar.convertSolarToLunar(year, month, day);
    const lunarMonth = lunarDate.month;

    // Get earthly branches for Left Support and Right Support based on lunar month
    const leftSupportEarthlyBranch = LEFT_SUPPORT_POSITIONS[lunarMonth];
    const rightSupportEarthlyBranch = RIGHT_SUPPORT_POSITIONS[lunarMonth];

    if (!leftSupportEarthlyBranch || !rightSupportEarthlyBranch) {
      throw new Error(
        `Invalid lunar month ${lunarMonth} for support stars calculation`
      );
    }

    // Get earthly branches for Wen Chang and Wen Qu based on hour
    const wenChangEarthlyBranch = WEN_CHANG_POSITIONS[hour];
    const wenQuEarthlyBranch = WEN_QU_POSITIONS[hour];

    if (!wenChangEarthlyBranch || !wenQuEarthlyBranch) {
      throw new Error(
        `Invalid hour ${hour} for Wen Chang and Wen Qu calculation`
      );
    }

    // Find palace positions based on earthly branches
    let leftSupportPosition = 0;
    let rightSupportPosition = 0;
    let wenChangPosition = 0;
    let wenQuPosition = 0;

    // Find the palace positions by comparing earthly branches
    for (let i = 0; i < this.chartData.palaces.length; i++) {
      const palace = this.chartData.palaces[i];
      if (!palace) continue;
      
      const palaceEarthlyBranch = palace.earthlyBranch;

      if (palaceEarthlyBranch === leftSupportEarthlyBranch) {
        leftSupportPosition = i + 1;
      }

      if (palaceEarthlyBranch === rightSupportEarthlyBranch) {
        rightSupportPosition = i + 1;
      }

      if (palaceEarthlyBranch === wenChangEarthlyBranch) {
        wenChangPosition = i + 1;
      }

      if (palaceEarthlyBranch === wenQuEarthlyBranch) {
        wenQuPosition = i + 1;
      }
    }

    // Verify all positions were found
    if (
      !leftSupportPosition ||
      !rightSupportPosition ||
      !wenChangPosition ||
      !wenQuPosition
    ) {
      console.error("Could not find all support star positions", {
        leftSupportEarthlyBranch,
        rightSupportEarthlyBranch,
        wenChangEarthlyBranch,
        wenQuEarthlyBranch,
        leftSupportPosition,
        rightSupportPosition,
        wenChangPosition,
        wenQuPosition,
      });
      throw new Error("Failed to find all support star positions");
    }

    // Create all four support stars
    const supportStars: Star[] = [
      {
        name: "左輔",
        brightness: "bright",
        palace: leftSupportPosition,
        isTransformed: false,
      },
      {
        name: "右弼",
        brightness: "bright",
        palace: rightSupportPosition,
        isTransformed: false,
      },
      {
        name: "文昌",
        brightness: "bright",
        palace: wenChangPosition,
        isTransformed: false,
      },
      {
        name: "文曲",
        brightness: "bright",
        palace: wenQuPosition,
        isTransformed: false,
      },
    ];

    // Add stars to their respective palaces
    supportStars.forEach((star) => {
      const palace = this.chartData.palaces[star.palace - 1];
      if (palace) {
        palace.minorStars.push(star);
      }
    });

    // Record the calculation step
    this.chartData.calculationSteps.step9 =
      `Support stars placed: ` +
      `左輔 in ${leftSupportEarthlyBranch} (palace ${leftSupportPosition}) and ` +
      `右弼 in ${rightSupportEarthlyBranch} (palace ${rightSupportPosition}) based on lunar month ${lunarMonth}, ` +
      `文昌 in ${wenChangEarthlyBranch} (palace ${wenChangPosition}) and ` +
      `文曲 in ${wenQuEarthlyBranch} (palace ${wenQuPosition}) based on hour ${hour}`;
  }

  /**
   * Step 10: Add Four Transformations (四化星) based on birth year's Heavenly Stem
   */
  private step10(): void {
    // DONE THIS IS CORRECT ALREADY
    // Get birth year's Heavenly Stem
    const yearStem = this.chartData.heavenlyStem;

    if (!yearStem) {
      throw new Error(
        "Birth year's Heavenly Stem must be calculated before adding transformations"
      );
    }

    // Get transformation rules for this Heavenly Stem
    const transformations = FOUR_TRANSFORMATIONS[yearStem];

    if (!transformations) {
      throw new Error(
        `No transformation rules found for Heavenly Stem ${yearStem}`
      );
    }

    // Apply each transformation
    const transformationResults: string[] = [];

    // Apply 化科 (Science)
    const scienceStar = findStarByName(
      this.chartData.palaces,
      transformations.科
    );
    if (scienceStar) {
      scienceStar.star.transformations = [
        ...(scienceStar.star.transformations || []),
        "化科",
      ];
      transformationResults.push(
        `化科 -> ${transformations.科} in palace ${scienceStar.palace}`
      );
    }

    // Apply 化權 (Power)
    const powerStar = findStarByName(
      this.chartData.palaces,
      transformations.權
    );
    if (powerStar) {
      powerStar.star.transformations = [
        ...(powerStar.star.transformations || []),
        "化權",
      ];
      transformationResults.push(
        `化權 -> ${transformations.權} in palace ${powerStar.palace}`
      );
    }

    // Apply 化祿 (Wealth)
    const wealthStar = findStarByName(
      this.chartData.palaces,
      transformations.祿
    );
    if (wealthStar) {
      wealthStar.star.transformations = [
        ...(wealthStar.star.transformations || []),
        "化祿",
      ];
      transformationResults.push(
        `化祿 -> ${transformations.祿} in palace ${wealthStar.palace}`
      );
    }

    // Apply 化忌 (Taboo)
    const tabooStar = findStarByName(
      this.chartData.palaces,
      transformations.忌
    );
    if (tabooStar) {
      tabooStar.star.transformations = [
        ...(tabooStar.star.transformations || []),
        "化忌",
      ];
      transformationResults.push(
        `化忌 -> ${transformations.忌} in palace ${tabooStar.palace}`
      );
    }

    // Record the calculation step
    this.chartData.calculationSteps.step10 =
      `Four Transformations based on birth year's Heavenly Stem ${yearStem}:\n` +
      transformationResults.join("\n");
  }

  /**
   * Step 11: Calculate Major Limits (大限) for each palace
   * Based on Five Elements and Life Palace position
   * Direction depends on gender and yin/yang
   */
  private step11(): void {
    const { gender } = this.input;
    const { yinYang, fiveElements, lifePalace } = this.chartData;

    if (!fiveElements) {
      throw new Error(
        "Five Elements must be calculated before determining Major Limits"
      );
    }

    // Get starting age based on Five Elements
    const startingAge = MAJOR_LIMIT_STARTING_AGES[fiveElements];
    if (!startingAge) {
      throw new Error(`Invalid Five Elements: ${fiveElements}`);
    }

    // Determine direction based on gender and yin/yang
    // Clockwise: Yang Male or Yin Female
    // Counter-clockwise: Yin Male or Yang Female
    const isClockwise =
      (gender === "male" && yinYang === "Yang") ||
      (gender === "female" && yinYang === "Yin");

      for (let i = 0; i < 12; i++) {
        let palaceIndex;
      
        if (isClockwise) {
          // Clockwise: move forward
          palaceIndex = (lifePalace - 1 + i) % 12;
        } else {
          // Counterclockwise: move backward
          palaceIndex = (lifePalace - 1 - i + 12) % 12;
        }
      
        const palace = this.chartData.palaces[palaceIndex];
        if (!palace) continue;
            
        // Calculate age range
        const ageOffset = i * 10;
        palace.majorLimit = {
          startAge: startingAge + ageOffset,
          endAge: startingAge + ageOffset + 9,
        };
      }
      
    // Record the calculation step
    this.chartData.calculationSteps.step11 =
      `Major Limits calculated starting from age ${startingAge} (${fiveElements}), ` +
      `starting at Life Palace ${lifePalace}, ` +
      `moving ${isClockwise ? "clockwise" : "counter-clockwise"} ` +
      `for ${gender} with ${yinYang} polarity`;
  }

  /**
   * Step 12: Calculate Annual Flow (流年) positions
   * Starting from palace 1 with year 2013, going clockwise
   * Each palace represents one year in sequence
   */
  private step12(): void {
    // Get current year
    const currentYear = new Date().getFullYear();

    // Calculate the base year (2013) position in the current cycle
    const baseYear = 2013;
    const cycleLength = 12;

    // For each palace, calculate which year it represents in the current cycle
    for (let i = 0; i < 12; i++) {
      const palace = this.chartData.palaces[i];
      if (!palace) continue;

      // Calculate the year for this palace position
      // Palace 1 (i=0) starts with 2013, then goes clockwise
      const yearOffset = i;
      const year = baseYear + yearOffset;

      // Calculate the actual year in the current cycle
      const yearsSinceBase = currentYear - baseYear;
      const cycleOffset =
        Math.floor(yearsSinceBase / cycleLength) * cycleLength;
      const actualYear = year + cycleOffset;

      // Calculate the Heavenly Stem and Earthly Branch for this year
      const stemIndex = (actualYear - 4) % 10; // 2013 is 癸 (9th stem)
      const branchIndex = (actualYear - 1) % 12; // 2013 is 巳 (5th branch)

      palace.annualFlow = {
        year: actualYear,
        heavenlyStem: HEAVENLY_STEMS[stemIndex] as HeavenlyStemType,
        earthlyBranch: EARTHLY_BRANCHES[branchIndex] as EarthlyBranchType,
      };
    }

    // Find which palace represents the current year
    const currentYearPalace = this.chartData.palaces.find(
      (palace) => palace.annualFlow?.year === currentYear
    );

    // Record the calculation step
    this.chartData.calculationSteps.step12 =
      `Annual Flow calculated for current year ${currentYear}. ` +
      `Current year is in palace ${currentYearPalace?.number ?? "unknown"}. ` +
      `Base cycle: 2013-2024, repeating every 12 years.`;
  }


}
