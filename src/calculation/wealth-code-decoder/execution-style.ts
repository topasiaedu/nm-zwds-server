// axes
type Axis = "speed" | "structure" | "risk" | "collab" | "clarity";
type AxisScore = Partial<Record<Axis, number>>;

export type StarKey =
  | "紫微"
  | "破军"
  | "天府"
  | "廉贞"
  | "太阴"
  | "贪狼"
  | "巨门"
  | "天同"
  | "天相"
  | "武曲"
  | "天梁"
  | "太阳"
  | "七杀"
  | "天机"
  | "左辅"
  | "右弼"
  | "文昌"
  | "文曲";

// Scoring table (–3…+3). Unspecified axes default to 0.
export const STAR_SCORES: Record<StarKey, AxisScore> = {
  // 主星
  紫微: { structure: +2, speed: -1, collab: +1, clarity: +1 }, // 统筹、定标准
  破军: { speed: +2, structure: -2, risk: +3, collab: -1, clarity: -1 }, // 破旧立新、冒险快冲
  天府: { structure: +2, speed: -1, risk: -1, collab: +1 }, // 稳健、保全
  廉贞: { speed: +1, structure: -1, risk: +1 }, // 机变、权谋
  太阴: { speed: -2, structure: +1, collab: +2, risk: -1, clarity: +1 }, // 温润、耐心推进
  贪狼: { speed: +2, structure: -2, risk: +2, collab: +1, clarity: -1 }, // 社交驱动、试错快
  巨门: { structure: +1, speed: -1, clarity: +1 }, // 质疑与表达、把关细节
  天同: { speed: -2, collab: +2, risk: -1 }, // 协调与安抚
  天相: { structure: +2, speed: -1, collab: +1, clarity: +1, risk: -1 }, // 行政治理、公允
  武曲: { structure: +1, speed: +1, risk: +1 }, // 执行力、纪律
  天梁: { structure: +2, speed: -1, collab: +1, clarity: +1, risk: -1 }, // 原则与护持
  太阳: { speed: +2, collab: +1, risk: +1 }, // 外向推动、曝光
  七杀: { speed: +2, risk: +2, collab: -1 }, // 果断突击
  天机: { speed: -2, structure: +1, clarity: +2 }, // 策略、分析

  // 助辅星（在职业宫或三方会照时也计入）
  左辅: { collab: +1, structure: +1 }, // 扶助与落地
  右弼: { collab: +1, structure: +1 }, // 配合与完善
  文昌: { structure: +2, clarity: +1 }, // 文字、规范
  文曲: { structure: +2, clarity: +1 }, // 表达、美感
};
type ExecutionType =
  | "指挥官 Commander"
  | "架构师 Architect"
  | "催化者 Catalyst"
  | "整合者 Integrator";

const toBar = (x: number) => Math.max(0, Math.min(100, 50 + x * 8)); // –3..+3 -> 26..74

export function classifyExecution(stars: StarKey[]) {
  const axes: Record<Axis, number> = {
    speed: 0,
    structure: 0,
    risk: 0,
    collab: 0,
    clarity: 0,
  };
  for (const s of stars)
    for (const [k, v] of Object.entries(STAR_SCORES[s] || {}))
      axes[k as Axis] += v as number;

  const type: ExecutionType =
    axes.speed >= 0 && axes.structure >= 0
      ? "指挥官 Commander"
      : axes.speed < 0 && axes.structure >= 0
      ? "架构师 Architect"
      : axes.speed >= 0 && axes.structure < 0
      ? "催化者 Catalyst"
      : "整合者 Integrator";

  const bars = {
    decisionSpeed: toBar(axes.speed),
    structurePref: toBar(axes.structure),
    riskTolerance: toBar(axes.risk),
    collaboration: toBar(axes.collab),
    clarityFocus: toBar(axes.clarity),
  };

  return { type, bars, raw: axes };
}

// Example:
// classifyExecution(["武曲","七杀","文昌","右弼"]) -> 指挥官 Commander (高速度/中高结构)
