/**
 * Career Palace（官禄）   Execution Style Bars
 * - Dynamic normalization per profile
 * - Friendly uplift: neutral -> 70, hard floor at 60
 */

export type StarKey =
  | "紫微" | "破军" | "天府" | "廉贞" | "太阴" | "贪狼" | "巨门" | "天同"
  | "天相" | "武曲" | "天梁" | "太阳" | "七杀" | "天机" | "左辅" | "右弼" | "文昌" | "文曲";

type CareerAxis = "speed" | "structure" | "risk" | "collab" | "clarity";

export type CareerBars = {
  decisionSpeed: number;
  structurePref: number;
  riskTolerance: number;
  collaboration: number;
  clarityFocus: number;
};

export type BarOptions = {
  majorWeight?: number;    // default 1
  supportWeight?: number;  // default 0.5
  minFloor?: number;       // default 60   (nobody below this)
  neutralBar?: number;     // default 70   (no-signal baseline)
  floorMode?: "hard" | "rescale"; // default "hard"
};

export const CAREER_SCORES: Record<StarKey, Partial<Record<CareerAxis, number>>> = {
  "紫微": { structure:+2, speed:-1, collab:+1, clarity:+1 },
  "破军": { speed:+2, structure:-2, risk:+3, collab:-1, clarity:-1 },
  "天府": { structure:+2, speed:-1, risk:-1, collab:+1 },
  "廉贞": { speed:+1, structure:-1, risk:+1 },
  "太阴": { speed:-2, structure:+1, collab:+2, risk:-1, clarity:+1 },
  "贪狼": { speed:+2, structure:-2, risk:+2, collab:+1, clarity:-1 },
  "巨门": { structure:+1, speed:-1, clarity:+1 },
  "天同": { speed:-2, collab:+2, risk:-1 },
  "天相": { structure:+2, speed:-1, collab:+1, clarity:+1, risk:-1 },
  "武曲": { structure:+1, speed:+1, risk:+1 },
  "天梁": { structure:+2, speed:-1, collab:+1, clarity:+1, risk:-1 },
  "太阳": { speed:+2, collab:+1, risk:+1 },
  "七杀": { speed:+2, risk:+2, collab:-1 },
  "天机": { speed:-2, structure:+1, clarity:+2 },
  "左辅": { collab:+1, structure:+1 },
  "右弼": { collab:+1, structure:+1 },
  "文昌": { structure:+2, clarity:+1 },
  "文曲": { structure:+2, clarity:+1 },
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
  table: Record<StarKey, Partial<Record<CareerAxis, number>>>
) {
  const sum = {} as Record<CareerAxis, number>;
  const cap = {} as Record<CareerAxis, number>;
  for (const { key, weight } of stars) {
    const entry = table[key] || {};
    for (const [ax, v] of Object.entries(entry) as [CareerAxis, number][]) {
      sum[ax] = (sum[ax] ?? 0) + v * weight;
      cap[ax] = (cap[ax] ?? 0) + Math.abs(v) * weight; // max possible magnitude
    }
  }
  return { sum, cap };
}

function toBar(
  sum: number | undefined,
  cap: number | undefined,
  { minFloor, neutralBar, floorMode }: ReturnType<typeof withDefaults>
) {
  if (!cap) return neutralBar; // no signals -> positive neutral
  const base = 50 + (sum! / cap) * 50; // -cap..+cap -> 0..100

  let lifted: number;
  if (floorMode === "rescale") {
    // compress to [minFloor..100]
    lifted = minFloor + (100 - minFloor) * (base / 100);
  } else {
    // bias mid up to neutral, then floor
    const uplift = neutralBar - 50;
    lifted = Math.min(100, base + uplift);
    lifted = Math.max(minFloor, lifted);
  }
  return Math.round(lifted);
}

/* ------------------------------ API ----------------------------------- */

export function computeCareerBars(
  careerPalaceStars: StarKey[],
  supportingStars: StarKey[] = [],
  opts: BarOptions = {}
): CareerBars {
  const conf = withDefaults(opts);
  const stars = buildWeightedList(careerPalaceStars, supportingStars, conf);
  const { sum, cap } = aggregateAxes(stars, CAREER_SCORES);

  return {
    decisionSpeed: toBar(sum.speed,     cap.speed,     conf),
    structurePref: toBar(sum.structure, cap.structure, conf),
    riskTolerance: toBar(sum.risk,      cap.risk,      conf),
    collaboration: toBar(sum.collab,    cap.collab,    conf),
    clarityFocus:  toBar(sum.clarity,   cap.clarity,   conf),
  };
}

/* Example:
const bars = computeCareerBars(["武曲","七杀"], ["文昌","右弼"]);
*/
