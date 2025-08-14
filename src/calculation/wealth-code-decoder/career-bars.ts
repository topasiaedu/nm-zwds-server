/**
 * Wealth Palace（财帛） — Money Behavior & Strategy Bars
 * - Dynamic normalization per profile
 * - Friendly uplift: neutral -> 70, hard floor at 60
 */

export type StarKey =
  | "紫微" | "破军" | "天府" | "廉贞" | "太阴" | "贪狼" | "巨门" | "天同"
  | "天相" | "武曲" | "天梁" | "太阳" | "七杀" | "天机" | "左辅" | "右弼" | "文昌" | "文曲";

type WealthAxis = "earning" | "asset" | "risk" | "discipline" | "dealflow";

export type WealthBars = {
  earningDrive: number;
  assetStrategy: number;
  riskLeverage: number;
  moneyDiscipline: number;
  dealFlowNetwork: number;
};

export type BarOptions = {
  majorWeight?: number;    // default 1
  supportWeight?: number;  // default 0.5
  minFloor?: number;       // default 60
  neutralBar?: number;     // default 70
  floorMode?: "hard" | "rescale"; // default "hard"
};

export const WEALTH_SCORES: Record<StarKey, Partial<Record<WealthAxis, number>>> = {
  "紫微": { asset:+2, discipline:+1, dealflow:+1 },
  "破军": { earning:+2, asset:-1, risk:+3, discipline:-1 },
  "天府": { asset:+2, earning:-1, discipline:+1, risk:-1 },
  "廉贞": { earning:+1, asset:-1, risk:+1, dealflow:+1 },
  "太阴": { earning:-1, asset:+1, discipline:+2, risk:-1 },
  "贪狼": { earning:+2, asset:-1, risk:+2, discipline:-2, dealflow:+2 },
  "巨门": { earning:-1, asset:+1, discipline:+1 },
  "天同": { earning:-1, discipline:+1, risk:-1, dealflow:+1 },
  "天相": { asset:+2, discipline:+1, risk:-1 },
  "武曲": { earning:+2, asset:+1, discipline:+1, risk:+1 },
  "天梁": { asset:+2, discipline:+1, risk:-1, dealflow:+1 },
  "太阳": { earning:+2, dealflow:+1, risk:+1 },
  "七杀": { earning:+2, risk:+2, discipline:-1 },
  "天机": { asset:+2, dealflow:+1 },
  "左辅": { discipline:+1, asset:+1, dealflow:+1 },
  "右弼": { discipline:+1, asset:+1, dealflow:+1 },
  "文昌": { asset:+2, discipline:+1 },
  "文曲": { asset:+1, discipline:+1, dealflow:+1 },
};

/* --------------------------- implementation --------------------------- */

type WeightedStar = { key: StarKey; weight: number };

function withDefaults(opts: BarOptions) {
  return {
    majorWeight: 1,
    supportWeight: 0.5,
    minFloor: 60,
    neutralBar: 70,
    floorMode: "hard" as const,
    ...opts,
  };
}

function buildWeightedList(
  majors: StarKey[],
  supports: StarKey[] = [],
  { majorWeight = 1, supportWeight = 0.5 }: BarOptions
): WeightedStar[] {
  const list: WeightedStar[] = [];
  for (const k of majors) list.push({ key: k, weight: majorWeight });
  for (const k of supports) list.push({ key: k, weight: supportWeight });
  return list;
}

function aggregateAxes(
  stars: WeightedStar[],
  table: Record<StarKey, Partial<Record<WealthAxis, number>>>
) {
  const sum = {} as Record<WealthAxis, number>;
  const cap = {} as Record<WealthAxis, number>;
  for (const { key, weight } of stars) {
    const entry = table[key] || {};
    for (const [ax, v] of Object.entries(entry) as [WealthAxis, number][]) {
      sum[ax] = (sum[ax] ?? 0) + v * weight;
      cap[ax] = (cap[ax] ?? 0) + Math.abs(v) * weight;
    }
  }
  return { sum, cap };
}

function toBar(
  sum: number | undefined,
  cap: number | undefined,
  { minFloor, neutralBar, floorMode }: ReturnType<typeof withDefaults>
) {
  if (!cap) return neutralBar;
  const base = 50 + (sum! / cap) * 50; // -cap..+cap -> 0..100

  let lifted: number;
  if (floorMode === "rescale") {
    lifted = minFloor + (100 - minFloor) * (base / 100);
  } else {
    const uplift = neutralBar - 50;
    lifted = Math.min(100, base + uplift);
    lifted = Math.max(minFloor, lifted);
  }
  return Math.round(lifted);
}

/* ------------------------------ API ----------------------------------- */

export function computeWealthBars(
  wealthPalaceStars: StarKey[],
  supportingStars: StarKey[] = [],
  opts: BarOptions = {}
): WealthBars {
  const conf = withDefaults(opts);
  const stars = buildWeightedList(wealthPalaceStars, supportingStars, conf);
  const { sum, cap } = aggregateAxes(stars, WEALTH_SCORES);

  return {
    earningDrive:    toBar(sum.earning,    cap.earning,    conf),
    assetStrategy:   toBar(sum.asset,      cap.asset,      conf),
    riskLeverage:    toBar(sum.risk,       cap.risk,       conf),
    moneyDiscipline: toBar(sum.discipline, cap.discipline, conf),
    dealFlowNetwork: toBar(sum.dealflow,   cap.dealflow,   conf),
  };
}

/* Example:
const bars = computeWealthBars(["武曲","贪狼"], ["文昌"]);
*/
