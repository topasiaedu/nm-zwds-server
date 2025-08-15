/**
 * Life Palace（命宫） — 5-Bar Personality Snapshot
 * Bars: Identity & Confidence / Drive & Initiative / Adaptability / Emotional Poise / Clarity & Judgment
 * - Dynamic normalization per profile
 * - Friendly uplift: neutral -> 70, hard floor at 60 (configurable)
 */

export type StarKey =
  | "紫微" | "破军" | "天府" | "廉贞" | "太阴" | "贪狼" | "巨门" | "天同"
  | "天相" | "武曲" | "天梁" | "太阳" | "七杀" | "天机" | "左辅" | "右弼" | "文昌" | "文曲";

type LifeAxis = "identity" | "drive" | "adapt" | "poise" | "clarity";

export type LifeBars = {
  identityConfidence: number;
  driveInitiative: number;
  adaptability: number;
  emotionalPoise: number;
  clarityJudgment: number;
};

export type BarOptions = {
  majorWeight?: number;      // default 1
  supportWeight?: number;    // default 0.5
  minFloor?: number;         // default 60   (nobody below this)
  neutralBar?: number;       // default 70   (no-signal baseline)
  floorMode?: "hard" | "rescale"; // default "hard"
};

/** Star → axis contributions (–3..+3; unspecified = 0). Tuned for 命宫. */
export const LIFE_SCORES: Record<StarKey, Partial<Record<LifeAxis, number>>> = {
  "紫微": { identity:+2, drive:+0,   adapt:-1, poise:+1, clarity:+1 },  // core identity, steady judgement
  "破军": { identity:+1, drive:+2,   adapt:+2, poise:-2, clarity:-1 },  // bold change, impulsive
  "天府": { identity:+1, drive:-1,   adapt:-1, poise:+2, clarity:+1 },  // composed, conservative
  "廉贞": { identity:+1, drive:+1,   adapt:+1, poise:-1, clarity:+0 },  // resourceful, passionate
  "太阴": { identity:+0, drive:-1,   adapt:+1, poise:+2, clarity:+1 },  // gentle, reflective
  "贪狼": { identity:+1, drive:+2,   adapt:+2, poise:-1, clarity:-1 },  // charismatic momentum
  "巨门": { identity:+0, drive:-1,   adapt:+0, poise:-1, clarity:+1 },  // questioning, articulate
  "天同": { identity:+0, drive:-2,   adapt:+1, poise:+2, clarity:+0 },  // easygoing, comforting
  "天相": { identity:+1, drive:+0,   adapt:+1, poise:+1, clarity:+1 },  // fair, composed
  "武曲": { identity:+1, drive:+2,   adapt:-1, poise:+0, clarity:+1 },  // disciplined, determined
  "天梁": { identity:+1, drive:-1,   adapt:+0, poise:+2, clarity:+1 },  // protective, principled
  "太阳": { identity:+2, drive:+2,   adapt:+1, poise:-1, clarity:+1 },  // confident, energetic
  "七杀": { identity:+1, drive:+3,   adapt:+1, poise:-2, clarity:-1 },  // forceful, high drive
  "天机": { identity:+0, drive:-1,   adapt:+2, poise:-1, clarity:+2 },  // thoughtful, adaptable
  "左辅": { identity:+0, drive:+0,   adapt:+1, poise:+1, clarity:+1 },  // supportive balance
  "右弼": { identity:+0, drive:+0,   adapt:+1, poise:+1, clarity:+1 },  // supportive balance
  "文昌": { identity:+0, drive:+0,   adapt:+0, poise:+0, clarity:+2 },  // logic, articulation
  "文曲": { identity:+1, drive:+0,   adapt:+0, poise:+1, clarity:+2 },  // expression, aesthetics
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
  table: Record<StarKey, Partial<Record<LifeAxis, number>>>
) {
  const sum = {} as Record<LifeAxis, number>;
  const cap = {} as Record<LifeAxis, number>;
  for (const { key, weight } of stars) {
    const entry = table[key] || {};
    for (const [ax, v] of Object.entries(entry) as [LifeAxis, number][]) {
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
  if (!cap) return neutralBar; // no signals -> positive neutral
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

/* ------------------------------- API ---------------------------------- */

export function computeLifeBars(
  mingPalaceStars: StarKey[],          // 命宫 stars
  supportingStars: StarKey[] = [],     // optional 三方会照等
  opts: BarOptions = {}
): LifeBars {
  const conf = withDefaults(opts);
  const stars = buildWeightedList(mingPalaceStars, supportingStars, conf);
  const { sum, cap } = aggregateAxes(stars, LIFE_SCORES);

  return {
    identityConfidence: toBar(sum.identity, cap.identity, conf),
    driveInitiative:    toBar(sum.drive,    cap.drive,    conf),
    adaptability:       toBar(sum.adapt,    cap.adapt,    conf),
    emotionalPoise:     toBar(sum.poise,    cap.poise,    conf),
    clarityJudgment:    toBar(sum.clarity,  cap.clarity,  conf),
  };
}

/* ----------------------------- Examples --------------------------------

const life = computeLifeBars(
  ["紫微","武曲"],             // 命宫
  ["文昌","左辅"]              // 可选支持
);

// Want raw-looking bars like your screenshot (can go below 60):
// const rawLife = computeLifeBars(["紫微"], [], { minFloor: 0, neutralBar: 50 });

*/
