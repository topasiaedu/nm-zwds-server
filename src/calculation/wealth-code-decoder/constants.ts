// constants.ts
// Centralized JSON constants
// ------------------------------------------------------------
// Add new JSON blocks as exported constants in this file.
// Each block should be valid JSON (keys/values), typed via JSONValue/JSONObject below.
// Example:
// export const HOME_PAGE_COPY: JSONObject = {
//   title: "Welcome",
//   hero: { headline: "Acme", subtitle: "Do more" },
// };

// Generic JSON types
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
export type JSONObject = { [key: string]: JSONValue };

// ------------------------------------------------------------
// 🔽 Add your exported JSON blocks below this line
// ------------------------------------------------------------

export const EXECUTION_STYLE_DESCRIPTION: JSONObject = {
  "Commander": "You operate as a Commander: crisp decisions, visible cadence, zero drift. You convert strategy into sprints, set check-in rhythms, and make ownership unambiguous. Colleagues read your scoreboard and understand what ‘done’ means, because you define acceptance criteria and close loops fast. You tend to decide early, narrow scope, and protect momentum under pressure. This discipline delivers results, especially in deadline-heavy work. Watchouts: bulldozing discovery or muting dissent. Build a short ‘challenge the plan’ window, run quick pre-mortems, and calibrate risk before locking the route. You lead best where pace, structure, and accountability matter.",
  "Architect": "You operate as an Architect: measured, exacting, clarity-first. You design systems before speed, mapping flows, interfaces, and failure modes so teams build once, not twice. Documentation, quality gates, and versioned standards are your leverage; you prevent rework and create scale. You tend to front-load discovery, test assumptions early, and make trade-offs explicit. This steadiness suits regulated, complex, or long-horizon work. Watchouts: slow starts and analysis drag. Timebox investigation, define ‘good enough’ thresholds, prototype to de-risk, and set decision windows so progress compounds while quality stays high.",
  "Catalyst": "You operate as a Catalyst: fast, flexible, momentum-hungry. You spark experiments, recruit allies, and turn small wins into a narrative that moves people. You prefer shipping a scrappy v1, gathering live signal, and iterating in tight loops. You tend to unblock with influence, connect dots across teams, and keep energy high when others stall. This bias accelerates launches and change initiatives. Watchouts: inconsistency, mess, and unmanaged exposure. Add simple guardrails—budgets, stop-rules, owners—so bets stay contained. Broadcast learning openly and codify what works so sparks become repeatable systems.",
  "Integrator": "You operate as an Integrator: collaborative, adaptive, steady under complexity. You connect contexts, translate aims between functions, and shape shared routines that let diverse people do great work together. Discovery and co-design are your starting moves; you surface dissent early and help the group decide well. You tend to resolve friction, negotiate interfaces, and sustain progress through rituals and follow-through. This style shines in cross-silo programs and partnership-heavy work. Watchouts: soft boundaries and slow decisions. Define authority, escalation paths, and decision windows upfront so harmony does not dilute accountability."
};

export const EXECUTION_STYLE_LEADERSHIP: JSONObject = {
  "Commander": "Lead with cadence and clarity. Set weekly targets, daily signals, and a visible scoreboard. Define 'done' with acceptance criteria, owners, and SLA-like timelines. Protect deep-work blocks, triage scope, and remove blockers quickly. Invite dissent before committing; run pre-mortems on critical bets. Your edge: speed with discipline—use guardrails, not micromanagement, to keep pace high and quality reliable.",
  "Architect": "Lead by design and documentation. Start with a written architecture brief, interfaces, and service levels. Establish stage gates, review checklists, and test thresholds before spend scales. Timebox discovery, prototype risky components, and publish decision logs people can trust. Coach teams to write, version, and refactor their standards. Your edge: reliability at scale—systems that make good choices the default.",
  "Catalyst": "Lead through momentum and narrative. Frame bets with clear success criteria, budgets, and stop rules. Launch scrappy pilots, broadcast learning, and promote owners who move first responsibly. Keep cycles short, celebrate progress, and make it safe to sunset losing ideas. Pair speed with lightweight risk caps and a simple escalation path. Your edge: energy that converts possibilities into adoption.",
  "Integrator": "Lead through alignment and boundaries. Facilitate kickoffs that clarify roles, decision rights, and interfaces. Install rituals—standups, demos, retros—that surface dissent and commitments. Map dependencies, negotiate SLAs across teams, and keep a shared roadmap visible. Set decision windows and escalation paths so harmony doesn't slow action. Your edge: durable collaboration that turns complexity into coordinated execution."
};

export const EXECUTION_STYLE_TEAM_MEMBER: JSONObject = {
  "Commander": "Contribute with ownership and speed. Take clear slices of scope, define ‘done,’ and post daily signals so others can align. Unblock yourself quickly, escalate with options, and close loops in writing. Invite dissent before finalizing, and use lightweight checklists to keep quality high without slowing cadence.",
  "Architect": "Contribute through rigor and clarity. Write short specs, document interfaces, and keep runbooks current so teammates move confidently. Raise risks early with data, propose prototypes to test assumptions, and follow stage gates without ceremony. Protect quality by using checklists and peer review while keeping decisions timeboxed.",
  "Catalyst": "Contribute by creating momentum. Volunteer for ambiguous work, ship a scrappy v1, and broadcast learning so the team sees signal quickly. Recruit allies, keep cycles short, and manage exposure with budgets and stop rules. Turn wins into repeatable plays by codifying what worked after each iteration.",
  "Integrator": "Contribute by connecting dots. Translate between functions, map dependencies, and track agreements so handoffs are smooth. Surface dissent early and help the group decide within clear windows. Hold boundaries kindly—clarify ownership, document next steps, and follow through until commitments are closed."
};

export const EXECUTION_STYLE_LEVERAGE: JSONObject = {
  "Commander": [
    {
      "title": "Cadence",
      "description": "Install weekly goals, daily progress signals, and a single visible scoreboard. Name owners, due dates, and dependencies. Keep work in small, inspectable increments so speed is measurable and slippage is obvious."
    },
    {
      "title": "Process",
      "description": "Codify your playbooks: definitions of done, SOPs, and handoff checklists. Write once, reuse often, and tighten after each retro. Documentation should make the next person faster without you in the room."
    },
    {
      "title": "Accountability",
      "description": "Run a short dissent window, then commit. Log decisions, run pre‑mortems on critical bets, and cap scope changes with a simple change request. Remove blockers same day and close loops in writing to reinforce standards."
    }
  ],
  "Architect": [
    {
      "title": "System Design",
      "description": "Start with an architecture brief: objectives, constraints, interfaces, and failure modes. Map data and control flows, choose standards, and draw boundaries. Aim for maintainability and clear ownership before a line of code ships."
    },
    {
      "title": "Documentation",
      "description": "Create living specs, templates, and runbooks. Version them, link to decisions, and automate check generation where possible. Good docs make onboarding trivial and reduce meetings."
    },
    {
      "title": "Quality Gates",
      "description": "Define review criteria, test thresholds, and rollout stages. Instrument quality metrics and make them visible. Ship behind feature flags and learn safely before broad release."
    }
  ],
  "Catalyst": [
    {
      "title": "Small Bets",
      "description": "Frame bets with success criteria, budget, and stop‑rules. Ship a scrappy v1 in days, not weeks, and capture real‑world signal. Use the data to double‑down or sunset quickly."
    },
    {
      "title": "Narrative Power",
      "description": "Tell the story: problem, bet, signal, next move. Demo early, recruit early adopters, and broadcast wins and lessons. Momentum compounds when people can see progress."
    },
    {
      "title": "Guardrails",
      "description": "Keep exposure contained: cap spend, limit blast radius, and assign a single owner. Maintain a simple risk log and a 24‑hour escalation path. Speed is safe when the edges are clear."
    }
  ],
  "Integrator": [
    {
      "title": "Alignment",
      "description": "Open with a kickoff that sets shared goals, roles, and working norms. Use one roadmap and transparent priorities. Facilitate to surface dissent fast and commit as a group."
    },
    {
      "title": "Interfaces",
      "description": "Map dependencies and agree on SLAs, definitions, and integration checkpoints. Create checklists for handoffs and a shared glossary to reduce rework across functions."
    },
    {
      "title": "Decision Hygiene",
      "description": "Timebox choices, define decision rights, and document outcomes with owners. Escalate on facts, not politics, and run regular retros to refine the collaboration system."
    }
  ]
};
