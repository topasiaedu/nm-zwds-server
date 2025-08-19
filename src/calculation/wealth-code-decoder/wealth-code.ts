// constants.ts
// Wealth Code descriptions (English only). Similar structure to Execution Style.

export type WealthCodeKey =
  | "Strategy Planner"
  | "Investment Brain"
  | "Branding Magnet"
  | "Collaborator";

export const WEALTH_CODE_DESCRIPTION: Record<WealthCodeKey, string> = {
  Collaborator: `You grow wealth through people. Partnerships and retainers suit you because you turn promises into progress. Just be careful of doing everyone’s job, it blurs lines and caps your rate. Keep roles and response times clear, price for responsibility, and get decisions in writing so momentum isn’t on your shoulders. Small templates and a weekly 15-minute sync make your trust scalable.`,

  "Strategy Planner": `You compound with systems and timing. You turn vision into roadmaps, budgets, and simple rules others can follow. Control helps, but too tight slows good ideas. Set decision windows, keep options to three, and hand one real lever to someone you trust. Publish playbooks and review leading indicators weekly so progress stays steady without micromanaging.`,

  "Investment Brain": `You win by logic and patient capital, money does the work. You size positions, price risk, and rebalance on schedule. But watch penny-wise cuts and endless tweaks that stall compounding. Decide how you’ll decide: set criteria upfront, cap downside with stops, and fund validated bets first. Prefer instruments you can hold, retainers, royalties, durable operations, so returns stack quietly.`,

  "Branding Magnet": `You monetise visibility and story. Attention creates demand; trust turns it into revenue. Hype without proof fades, so keep a weekly publishing rhythm, show receipts (case studies, before-afters), and route spikes of attention into one clear offer. Measure conversion, not applause, and protect capacity with simple office hours so presence scales without burnout.`,
};

export const WEALTH_CODE_LEADERSHIP: Record<WealthCodeKey, string> = {
  "Strategy Planner":
    "Lead by cadence and clarity. Build process-first businesses (B2B services, regulated ops, enterprise platforms). Favor multi-year roadmaps, retainers, and standard operating reviews over churny sprints. Publish decision rights, install weekly/quarterly scorecards, and delegate budgets with guardrails. Hire operators who love checklists and PMs who think in systems. ",
  "Investment Brain":
    "Lead by capital discipline. Build cashflow-first companies (subscriptions, infrastructure, asset-backed services). Favor reserves, unit-economics dashboards, and rebalancing cadences over impulse bets. Set hurdle rates, position sizes, and stop rules; fund experiments only after evidence. Hire FP&A and ops talent who speak in cohorts and cash conversion.",
  "Branding Magnet":
    "Lead by signal and proof. Build brand-led businesses (education, media, premium DTC, advisory). Favor content engines, community, and productized IP over one-off hype. Protect creator time, install a publishing cadence, and measure conversion not applause. Your edge: credible visibility that commands pricing power and repeat demand.",
  Collaborator:
    "Lead by partnership architecture. Build ecosystem businesses (platforms, channel sales, alliances, integrators). Favor retainers, revenue shares, and co-selling motions over solo heroics. Set clear SLAs, deal desks, and escalation paths; make joint scorecards visible. Hire partner managers and enablement teams who certify playbooks. Price for responsibility, not tasks. Your edge: durable, humane coordination that turns many hands into one reliable machine.",
};

// ---------------------------
// Classification helper
// ---------------------------

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

/**
 * Star → Wealth Code mapping.
 * A single star may suggest multiple Wealth Codes.
 */
export const STAR_TO_WEALTH_CODES: Readonly<
  Record<StarKey, Readonly<WealthCodeKey[]>>
> = {
  // Strategic/governance anchors
  紫微: ["Strategy Planner"],
  天府: ["Investment Brain", "Strategy Planner"],
  天梁: ["Strategy Planner", "Investment Brain"],
  天相: ["Collaborator", "Strategy Planner"],
  天机: ["Strategy Planner", "Investment Brain"],
  武曲: ["Investment Brain", "Strategy Planner"],
  廉贞: ["Strategy Planner"],

  // Transform / decisive
  破军: ["Investment Brain"],
  七杀: ["Investment Brain"],

  // Brand / persuasion
  太阳: ["Branding Magnet"],
  贪狼: ["Branding Magnet"],
  文曲: ["Branding Magnet"],
  文昌: ["Branding Magnet", "Investment Brain"],
  巨门: ["Branding Magnet", "Investment Brain"],

  // Service / enablement
  天同: ["Collaborator"],
  左辅: ["Collaborator", "Strategy Planner"],
  右弼: ["Collaborator"],
  太阴: ["Collaborator"],
};

export type ClassifyOptions = {
  /** If provided, return at most this many codes (after sorting by weight). */
  limit?: number;
  /**
   * Sorting preference when weights tie. Default priority favors
   * Strategy Planner > Investment Brain > Branding Magnet > Collaborator.
   */
  tieBreak?: "priority" | "alpha";
};

const DEFAULT_PRIORITY: WealthCodeKey[] = [
  "Strategy Planner",
  "Investment Brain",
  "Branding Magnet",
  "Collaborator",
];

/**
 * Given a list of Life/Wealth-relevant stars, return applicable Wealth Codes.
 * - Multiple codes may apply; the result is de-duplicated and sorted by vote weight.
 * - Unknown star strings are ignored safely.
 */
export function classifyWealthCodesByStars(
  stars: ReadonlyArray<string>,
  options: ClassifyOptions = {}
): WealthCodeKey[] {
  const counts: Record<WealthCodeKey, number> = {
    "Strategy Planner": 0,
    "Investment Brain": 0,
    "Branding Magnet": 0,
    Collaborator: 0,
  };

  for (const raw of stars) {
    const star = raw as StarKey;
    const codes = STAR_TO_WEALTH_CODES[star];
    if (!codes) continue;
    for (const code of codes) counts[code] += 1;
  }

  const entries = Object.entries(counts) as [WealthCodeKey, number][];
  entries.sort((a, b) => {
    // primary: higher vote weight first
    if (b[1] !== a[1]) return b[1] - a[1];
    // tie-breaker
    if ((options.tieBreak ?? "priority") === "alpha") {
      return a[0].localeCompare(b[0]);
    }
    return DEFAULT_PRIORITY.indexOf(a[0]) - DEFAULT_PRIORITY.indexOf(b[0]);
  });

  // filter out zero weights
  let result = entries.filter(([, w]) => w > 0).map(([code]) => code);
  if (options.limit && options.limit > 0)
    result = result.slice(0, options.limit);
  return result;
}

/**
 * Convenience helper: explain which stars triggered which Wealth Codes.
 */
export function explainWealthCodeVotes(
  stars: ReadonlyArray<string>
): Array<{ code: WealthCodeKey; weight: number; triggers: StarKey[] }> {
  const triggerMap: Record<WealthCodeKey, Set<StarKey>> = {
    "Strategy Planner": new Set<StarKey>(),
    "Investment Brain": new Set<StarKey>(),
    "Branding Magnet": new Set<StarKey>(),
    Collaborator: new Set<StarKey>(),
  };

  for (const raw of stars) {
    const star = raw as StarKey;
    const codes = STAR_TO_WEALTH_CODES[star];
    if (!codes) continue;
    for (const code of codes) triggerMap[code].add(star);
  }

  const out = (Object.keys(triggerMap) as WealthCodeKey[]).map((code) => ({
    code,
    weight: triggerMap[code].size,
    triggers: Array.from(triggerMap[code]),
  }));

  // Sort by weight desc, then default priority
  out.sort((a, b) =>
    b.weight !== a.weight
      ? b.weight - a.weight
      : DEFAULT_PRIORITY.indexOf(a.code) - DEFAULT_PRIORITY.indexOf(b.code)
  );
  return out.filter((x) => x.weight > 0);
}

export const WEALTH_CODE_TEAM_MEMBER: Record<WealthCodeKey, string> = {
  "Strategy Planner":
    "Be the systems builder. Choose roles with long horizons (program ops, PMO, compliance, enterprise product). Bring order roadmaps, RACIs, checklists, concise briefs and ask for depth over churn. Own process health, publish decision logs, and standardize handoffs so the team moves predictably. Set boundaries so rigor doesn’t become red tape. Path: analyst → project manager → operations strategist.",
  "Investment Brain":
    "Be the allocator’s right hand. Choose FP&A, treasury, revenue ops, or data roles where unit economics matter. Build models, size bets, and propose rebalances using cohorts and cash-conversion metrics. Protect margin with small, instrumented experiments and clear stop rules. Guard against over-optimization that stalls shipping. Path: analyst → senior FP&A/treasury → portfolio or biz-ops lead.",
  "Branding Magnet":
    "Be the signal maker. Choose content, growth, evangelism, partnerships, or sales enablement where audience and narrative convert to revenue. Ship on a publishing cadence, test messages, and optimize funnels for conversion not applause. Keep quality non-negotiable and protect maker time. Avoid vanity metrics; pair creativity with tight delivery. Path: creator/AE → growth or brand strategist → head of content/GTM.",
  Collaborator:
    "Be the integrator. Choose account management, customer success, partner ops, or project coordination where reliability compounds. Design SLAs, map dependencies, and run crisp handoffs so outcomes are predictable and humane. Document agreements, escalate early, and price your effort with clear scope. Boundaries prevent quiet burnout. Path: coordinator → senior AM/CSM → program or partner lead.",
};

export type Pillar = { title: string; description: string };

export const WEALTH_CODE_PILLARS: Record<WealthCodeKey, Pillar[]> = {
  "Strategy Planner": [
    {
      title: "Governance",
      description:
        "Publish decision rights, roadmaps, and definitions of done in one accessible place. Version them, link every project to an owner and outcome, and record why choices were made. Review on a cadence and prune dead processes. Writing turns intent into repeatable execution and lets new people ramp fast without extra meetings.",
    },
    {
      title: "Cadence",
      description:
        "Run weekly scoreboards and quarterly reviews with leading and lagging indicators. Break work into small, inspectable increments with visible owners, dates, and risks. Use daily progress signals not status theater and course-correct through short retros rather than big resets.",
    },
    {
      title: "Stewardship",
      description:
        "Set budget guardrails, change-control thresholds, and succession plans. Delegate with spending limits and clear escalation paths so decisions happen where the work is. Protect deep-work blocks and quality gates; scale through standards and training, not heroics or more meetings.",
    },
  ],
  "Investment Brain": [
    {
      title: "Unit Economics",
      description:
        "Instrument cohorts, CAC/LTV, payback, and cash conversion so every initiative earns its keep. Publish a simple unit-economics model and review variance monthly. Approve spend only when thresholds are met and documented; kill or fix work that cannot pay back on schedule.",
    },
    {
      title: "Allocation Rules",
      description:
        "Pre-define position sizing, rebalancing cadence, and hurdle rates to remove emotion. Use stop rules and maximum drawdown limits to cap downside. Keep a short written playbook so anyone can execute the policy the same way even on a bad day.",
    },
    {
      title: "Evidence Loops",
      description:
        "Fund small pilots with explicit success criteria and budgets. Run pre-mortems to anticipate failure modes, and post-mortems to lock in lessons. Keep decision logs and move capital only when new evidence changes expected value.",
    },
  ],
  "Branding Magnet": [
    {
      title: "Audience Engine",
      description:
        "Build a publishing cadence anchored by a clear point of view. Convert attention into owned lists and community with opt-ins, nurture sequences, and regular events. Measure reach, engagement, and conversion separately so you scale signal not noise.",
    },
    {
      title: "Offer Ladder",
      description:
        "Design a ladder from free value to flagship offers templates, courses, memberships, and high-touch productized services. Map the funnel and onboarding for each step, then set fulfillment standards and renewal triggers. Packaging consistency creates pricing power and predictable revenue.",
    },
    {
      title: "Delivery Proof",
      description:
        "Collect reviews, before-and-after stories, and case studies tied to measurable outcomes. Close the feedback loop with QA and customer success so the product continuously improves. Publish proof across sales and onboarding; credibility compounds faster than ads.",
    },
  ],
  Collaborator: [
    {
      title: "SLAs & Interfaces",
      description:
        "Define scope, handoffs, and service levels with acceptance criteria everyone understands. Build checklists and a shared glossary so teams speak the same language and rework drops. Keep an interface document for each partner and revisit it when reality changes.",
    },
    {
      title: "Operating Rhythm",
      description:
        "Run standups, demos, and retros that surface blockers and decisions quickly. Maintain one shared roadmap and joint scorecards so priorities stay synchronized. Rituals keep alignment constant without heavy meetings.",
    },
    {
      title: "Boundaries & Escalation",
      description:
        "Set decision windows, RACI, and a clear escalation path before work begins. Hold a humane pace while protecting commitments; say no to scope creep and yes to transparent trade-offs. Early escalation preserves relationships and results.",
    },
  ],
};
