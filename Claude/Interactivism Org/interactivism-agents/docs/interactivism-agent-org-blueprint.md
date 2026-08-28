# Interactivism: Agent-Augmented Agency Blueprint

**Phase 1 strategic design pass** · June 2026
Inputs: Master Prompt v1 · Outputs: Engagement lifecycle, role architecture, RACI, agent build specs, rollout sequence
Status: Blueprint v2 — hard Second-Partner gate replaced with the tiered Quality & Ethics Control system (§2.2)

---

## 0. Design Thesis (read this first)

The constraint on Interactivism's growth is not demand, craft, or credibility. It is **Partner-hours spent on work that is below Partner judgment level**: prospect research, sequence operation, CRM hygiene, status coordination, spec documentation, proposal assembly, QA passes, and case-study production. Every hour of that work is an hour not spent on the four things only a Partner can do: **client relationships, design judgment, strategic synthesis, and selling**.

The org design below follows four rules:

1. **Partners are a persona, not people.** Every role, prompt, and process refers to *Lead Partner*, *Second Partner*, or a *Register lookup* — never a name. Names live in exactly one place: the Credential & Asset Register, read at runtime.
2. **Agents absorb throughput; Partners keep accountability.** No agent is ever Accountable. Agent-produced, client-facing output ships through a **layered Quality & Ethics Control system (QEC, §2.2)** — machine checks on everything, Partner review tiered to artifact risk — so quality control is structural without ever making one Partner's availability a studio-wide bottleneck.
3. **The BD engine is a system with program instances.** One outbound *system* (infrastructure, agent specs, CRM conventions); N outbound *programs*, each a config file: `{vertical, ICP, credential_anchors, voice_corpus, operating_partner}`. Launching vertical #2 must be a configuration act, not a build act.
4. **Build for the bottleneck, not the org chart.** Rollout order is dictated by the RACI bottleneck cells (§3), not by which agent is most interesting to build.

---

## 1. Engagement Lifecycle

The skeleton holds with three structural edits: (a) the outbound engine is pulled out of the engagement lifecycle entirely and modeled as a **continuous program system** that *feeds* it; (b) "QA & launch" merges into Build as a gate, with **Launch** kept as its own short phase because that's where client perception of quality is set; (c) **Case study & referral harvest** is re-positioned as a *BD-engine input*, not an engagement afterthought — its failure mode (never getting written) is currently gating the live A&D program.

### Phase 0 — Demand Engine (continuous; not a per-engagement phase)

Two intake channels feeding one qualification funnel:

**0a. Outbound program system.** Each program instance runs: ICP refinement → prospect research & enrichment → sequence operation → reply triage → meeting booked. Operated by the program's designated Partner at the *judgment* layer only (reply strategy on warm threads, call-taking); agents run everything else.
**0b. Inbound intake.** Referrals, site inquiries, network pings. Routed to a Lead Partner by **capacity and credential fit via Register lookup** — never by who happened to receive it.

| | |
|---|---|
| **Objective** | Keep ≥ N qualified conversations/month entering Phase 1, independent of delivery load |
| **Entry criteria** | Program config exists (vertical, ICP, credential anchors, voice corpus, operating Partner); credential anchor (case study) published |
| **Exit criteria (per lead)** | Discovery call booked with a Lead Partner assigned |
| **Key deliverables** | Prospect lists (enriched), live sequences, reply triage log, booked calls, pipeline dashboard |
| **Typical duration** | Continuous; 2–6 weeks from first touch to booked call |
| **Failure modes** | **Feast/famine**: outbound stops the moment delivery spikes (the classic boutique death spiral). Sequences go stale. Credential anchor never publishes, so the program idles "ready to deploy" indefinitely. Inbound routed by social momentum instead of capacity/fit. |

### Phase 1 — Qualification & Discovery

| | |
|---|---|
| **Objective** | Decide fit (budget, scope, timeline, values) before any unpaid design thinking happens |
| **Entry** | Booked call; Lead Partner assigned (Register: capacity + credential fit) |
| **Exit** | Go/no-go decision logged; if go — problem framing, budget band, and decision-maker map confirmed |
| **Deliverables** | Qualification record (CRM), discovery call notes + synthesis, opportunity brief |
| **Duration** | 1–2 weeks, 1–2 calls |
| **Failure modes** | Free consulting disguised as discovery; qualifying on enthusiasm instead of budget authority; no written opportunity brief, so proposal drafting restarts from memory |

### Phase 2 — Proposal & SOW

| | |
|---|---|
| **Objective** | Convert a qualified opportunity into a signed-ready scope, price, and terms package |
| **Entry** | Opportunity brief; budget band confirmed |
| **Exit** | Proposal delivered ≤ 5 business days from discovery; verbal yes or structured negotiation underway |
| **Deliverables** | Proposal doc, SOW, pricing model (incl. hybrid cash/equity terms where applicable — 2.5× SAFE multiplier template from the terms library), assumptions register |
| **Duration** | 3–7 business days (this number is a weapon; most boutiques take 2–3 weeks) |
| **Failure modes** | **Slow turnaround kills momentum** — the #1 margin leak at this stage. Underpricing because scoping happened under time pressure. Bespoke terms reinvented per deal instead of drawn from the terms library. Equity structures negotiated without the model. |

### Phase 3 — Contracting & Kickoff

| | |
|---|---|
| **Objective** | Signature, payment terms locked, engagement instanced |
| **Entry** | Verbal yes |
| **Exit** | Signed SOW + first invoice issued + **kickoff record created** (Lead Partner, Second Partner, register snapshot, comms channels, cadence) |
| **Deliverables** | Executed contract, kickoff record (the runtime document every agent reads), kickoff deck, schedule, access checklist |
| **Duration** | 1–3 weeks (enterprise procurement can stretch this; the kickoff record should not wait for legal) |
| **Failure modes** | Work starts before signature ("we're basically signed"). Kickoff record skipped, so agents have no runtime context and escalations have no addresses. Second Partner never formally seated → the gate silently doesn't exist for this engagement. |

### Phase 4 — Research & Strategy

| | |
|---|---|
| **Objective** | Ground the engagement in evidence: stakeholder reality, user behavior, competitive position |
| **Entry** | Kickoff complete; access granted |
| **Exit** | Strategy readout accepted by client; design principles + success metrics agreed |
| **Deliverables** | Interview transcripts + synthesis, audit findings, competitive analysis, strategy readout deck, design principles |
| **Duration** | 2–4 weeks |
| **Failure modes** | **Synthesis bottleneck**: interviews pile up faster than one human can synthesize. Research theater (activities without decisions). Readout slips and compresses design time downstream. |

### Phase 5 — Design (concepts → systems → specs)

| | |
|---|---|
| **Objective** | From validated direction to build-ready specification |
| **Entry** | Strategy readout accepted |
| **Exit** | Specs accepted by client *and* build-feasibility confirmed |
| **Deliverables** | Concept directions, design system components/tokens, Figma files, written component specs, IA documentation, prototype(s) |
| **Duration** | 4–10 weeks depending on scope |
| **Failure modes** | **Unbounded revision loops** (no revision budget in SOW). **Spec debt** — design "done" in Figma but undocumented, so Build re-derives intent. Design-system decisions made per-screen instead of per-system. Partner taste applied too late (after production polish, where changes are expensive). |

### Phase 6 — Build & QA

| | |
|---|---|
| **Objective** | Ship the specified product at design-system fidelity |
| **Entry** | Accepted specs; repo + environments ready |
| **Exit** | QA matrix green; client UAT signed |
| **Deliverables** | Front-end implementation, design-system code, QA matrix + bug log, UAT record |
| **Duration** | 4–12 weeks |
| **Failure modes** | Handoff gap (specs interpreted, not followed). Freelancer variance discovered late. QA compressed into the final week. Design-system code drifts from design-system Figma — the two-sources-of-truth disease. |

### Phase 7 — Launch

| | |
|---|---|
| **Objective** | Controlled release; client perceives the quality they paid for |
| **Entry** | UAT signed |
| **Exit** | Live in production; launch retrospective held; **case-study raw material captured while fresh** |
| **Deliverables** | Launch checklist, deploy, retro notes, metrics baseline, raw case-study capture (screens, numbers, quotes) |
| **Duration** | 1–2 weeks |
| **Failure modes** | Launch treated as a deploy, not a moment. Metrics baseline never captured → case study has no numbers → credential anchor is weak → BD engine starves (this exact chain is live right now with the Kratos case study gating the A&D program). |

### Phase 8 — Retainer / Growth / Expansion

| | |
|---|---|
| **Objective** | Convert delivery trust into recurring revenue and expanded scope |
| **Entry** | Launch complete; relationship warm |
| **Exit** | Retainer signed or expansion SOW opened — or a deliberate, logged close-out |
| **Deliverables** | Retainer proposal, quarterly roadmap, account plan |
| **Duration** | Ongoing (Kratos at 9 years is the existence proof) |
| **Failure modes** | Reactive posture — waiting for the client to ask. No account plan, so expansion depends on the Lead Partner's ambient attention. Retainer scoped as "hours" instead of outcomes. |

### Phase 8.5 — Optimization Sprint (optional loop, not a step)

*Numbered 8.5 deliberately: this is an **optional, repeatable loop** that fires after delivery for some engagements — not a mandatory step in the main line. It sits between retainer (8) and case study (9) because it is retainer-adjacent measurement work; the decimal preserves every downstream reference to phases 1–9 and signals the branch honestly. Case study (9) happens regardless of whether an optimization sprint runs.*

A measurement-driven, post-delivery engagement offered selectively: take a shipped product and improve it against real usage data, using the **HEART framework** (Google's UX-metrics methodology — Happiness, Engagement, Adoption, Retention, Task Success, each worked Goals → Signals → Metrics) to define what "better" means before changing anything.

| | |
|---|---|
| **Objective** | Improve a shipped product against real usage, with success defined by client-agreed UX metrics rather than opinion |
| **Entry** | Product live with usage history; client appetite for optimization; analytics/instrumentation accessible (or instrumentable) |
| **Exit** | Agreed HEART metrics defined and baselined; a prioritized change set shipped; before/after measured and read out — or a logged decision not to proceed |
| **Key deliverables** | HEART framework worksheet (Goals → Signals → Metrics, 1–2 categories in focus); metric baseline; prioritized optimization backlog; shipped changes; before/after readout |
| **Typical duration** | 2–6 week sprint; may repeat |
| **Failure modes** | **Vanity metrics** — tracking what's easy to measure instead of what maps to the goal (the framework's own central warning). Defining goals in terms of existing business metrics ("more leads") instead of user-experience signals. Optimizing before a clean baseline exists, so improvement can't be proven. Scope creep from "sprint" into open-ended retainer without a defined exit. Measuring five categories shallowly instead of one or two well. |

**The judgment boundary (why this is Partner-led, not agent-led):** the core of HEART — taking a fuzzy client goal down through candidate signals to the two or three metrics actually worth tracking — is synthesis and client conversation, exactly the judgment the operating model reserves for Partners. Agent support, *if* this motion proves frequent enough to warrant it, is a thin throughput layer only: drafting the HEART worksheet structure, pulling **candidate** signals/metrics from existing analytics for the Partner to prune (candidates-with-evidence, never "the metrics"), formatting the framework as a client deliverable, and assembling the before/after readout once the Partner has interpreted the numbers. Same candidate-not-findings discipline R6/R14/R15 hold.

**Agent status — deferred, with a contract-shaped path.** No agent is built for this phase, and none should be until optimization sprints recur often enough to measure the need (building ahead of an unmeasured, sometimes-offered motion is the one place building-ahead stops being smart). When warranted, the right shape is **not a standalone agent** but a small `optimization-sprint` capability folded into `research-analyst` (R6) — it is evidence-processing-adjacent: pull candidate metrics from analytics, structure the worksheet — plus a **HEART method contract** (`contracts/methods/heart.md`, the same pattern as `contracts/heuristics/`) that the capability reads at runtime. The Goals → Signals → Metrics judgment stays Partner-owned; the agent does worksheet scaffolding and analytics pulls. Until then, this phase is fully Partner-run.

### Phase 9 — Case Study & Referral Harvest (BD-engine input, not epilogue)

| | |
|---|---|
| **Objective** | Convert the engagement into the next program's credential anchor |
| **Entry** | Launch retro + raw capture exist |
| **Exit** | Case study **published** (client-approved), referral asks made, credential added to Register |
| **Deliverables** | Case study (web + PDF), client approval record, 2–3 referral asks, Register update |
| **Duration** | 2–4 weeks elapsed — but ≤ 4 Partner-hours of actual effort once agentified |
| **Failure modes** | **It never gets written** because it's non-billable and Partners are billing. Client approval requested without a draft in hand (months of latency). Written as portfolio prose instead of evidence (no numbers, no narrative arc). This is the single highest-leverage failure mode in the studio today. |

---

## 2. Idealized Org: Roles & Skills

### 2.1 The human layer: one persona, two seats, one register

**The Partner persona**
*Mission:* Own client trust, design judgment, strategic synthesis, and commercial decisions for any engagement, end to end, staffing it with agents and freelancers.

*Capability union (every Partner is presumed credible across all of it):* generative discovery and design research; strategic synthesis and complex-systems design; director-level design direction and visual craft; design-system architecture and engineering; front-end development and data visualization; brand/product proposition development; consumer launch and platform depth; outbound/BD system building; ethics-forward judgment on AI-produced work.

*What a Partner is accountable for and never delegates:*

- The client relationship itself — every call where trust is built or risked
- Go/no-go, pricing, scope, and terms decisions
- Final design judgment: which concept, which direction, when it's good enough
- Strategic synthesis: the "so what" of research
- QEC duties when seated as Second: Tier-2 consultations, Tier-3 co-signatures, and the weekly sampling audit
- Anything that signs the studio's name in public

**Engagement instancing — the two seats**

| Decision class | Lead Partner | Second Partner |
|---|---|---|
| Pricing, scope changes, terms | **Decides** | Consulted on hybrid/equity structures |
| Client communications & relationship | **Owns** | Steps in only by explicit handoff |
| Design direction & concept selection | **Decides** | Consulted; may be first-author by kickoff staffing |
| Agent-produced client-facing/public output | Approves Tier 1–2 ships; co-signs Tier 3 | **Consulted per QEC tier** — async objection window on Tier 2, co-signature on Tier 3 only, sampling audit on everything (§2.2) |
| Domain-sensitive judgment (e.g., A&D disclosure) | Routes via Register | Routes via Register |
| Escalations from agents | Default address for engagement decisions | Address for Tier-2/Tier-3 QEC reviews |

Authorship-independence is preserved where it matters: on Tier-3 artifacts the co-signing Partner must be independent of authorship (when the Second Partner authored, the Lead performs the independent sign-off), and the weekly sampling audit is always performed by the non-authoring Partner. Everything else runs on machine review plus single-Partner approval — see §2.2.

**The Credential & Asset Register (runtime data — the only place names live)**

| Entry type | Current value | Routing consequence |
|---|---|---|
| A&D credential (Kratos OpsCenter, OpenSpace DS, Caltech; JPL shared) | Erik (JPL: Erik + Petra) | A&D-disclosure judgment, A&D program voice corpus |
| Consumer/SaaS credentials (Metacloud, LocalIQ, tvScientific, DSC) | Shared | Lead Partner = pure capacity/fit decision |
| Outbound system & pipeline infrastructure maintainer | Erik | System changes route here; *programs* route to operating Partner |
| Terms/templates library maintainer | Erik | Proposal-drafter agent reads templates from here |
| DS conventions & agent review-gate standards maintainer | Petra | Design-production + gate-checklist changes route here |
| Inbound channel strength | Petra (current) | Intake notes source; routing still capacity/fit |

*Functions that cannot honestly be made Partner-fungible today* (flagged per the brief — routed to Register, not hard-coded into roles): A&D-disclosure judgment and A&D client voice (Erik); outbound infrastructure surgery (Erik); design-system review-gate standards authorship (Petra). Each is a register entry with a rotation path: the maintainer documents conventions until the entry can flip or become shared.

### 2.2 Quality & Ethics Control System (QEC)

**Design change from v1:** the original blueprint put a hard Second-Partner gate on every agent-produced, client-facing artifact. That guarantees independence but creates a synchronous human dependency — one Partner on vacation or heads-down in delivery stalls every ship across every engagement. v2 replaces the single gate with **defense in depth**: five control layers, of which only the last two involve the Second Partner, and only the rarest artifact class requires their signature. Independence moves from a chokepoint to a property of the system.

**The risk-tier map.** Every client-facing or public artifact is assigned a tier at creation from the artifact-type table below (the producer agent assigns; **agents can escalate a tier but never downgrade one**):

| Tier | Artifact classes | Ship requirement | Second Partner |
|---|---|---|---|
| **1 — Routine** | Status updates, meeting notes, scheduling emails, reply drafts on active threads, QA summaries | Layers 1–2 pass + Lead/operating Partner approval | **Informed** — weekly shipped-artifact digest; subject to sampling audit |
| **2 — Commitment-bearing** | Proposals & SOWs, pricing options, new sequence templates, new public claims in outbound copy, expansion SOWs, account plans | Layers 1–2 pass + Lead Partner approval + **Second Partner consulted async**: 48-business-hour objection window; silence ships | **Consulted** — time-boxed; never blocks beyond the window |
| **3 — Public / disclosure-sensitive** | Case studies, website copy, anything published under the studio's name, any artifact tripping the disclosure scan (A&D, NDA-bound material) | Layers 1–2 pass + **both Partner approvals**, one independent of authorship | **Co-signs** — retained deliberately: Tier-3 artifacts are rare and never deadline-critical; a case study can wait a week |

*Availability handling:* Tier 1 never waits on the Second Partner. Tier 2's objection window runs on business hours — if the Second Partner is out or heads-down, the Lead ships after the window expires, with the reviewer-agent report logged and the artifact auto-queued into the next sampling audit. Tier 3 waits on purpose; nothing in that class has a deadline measured in days.

**The five control layers (step functions, cheapest first):**

1. **Agent self-review — every artifact.** Before flagging anything `qec:pending`, the authoring agent runs an adversarial second pass against its artifact-type checklist: claims traced to evidence, no fabricated signals, no pricing/scope/legal/date commitments, no individual names, voice-corpus fidelity. Self-review notes attach to the artifact. Catches the cheap errors at zero human cost.
2. **Independent reviewer agent — every client-facing artifact.** A dedicated `quality-ethics-reviewer` agent (spec 4.11) — fresh context, no authoring history, structurally independent by construction — scores the artifact against the studio rubric: claim/evidence trace, craft bar against published studio reference work, commitment scan, **disclosure tripwire** (term-and-context scan for A&D, NDA, and client-confidential material), and tier-assignment verification. Blocking findings bounce the artifact back to the authoring agent *before any Partner sees it*; pass reports attach to the artifact.
3. **Lead/operating Partner approval — every client-facing artifact.** Human judgment with the reviewer report in hand. Review becomes verification of flagged risk, not line-by-line proofreading — which is what makes single-Partner approval safe at Tiers 1–2.
4. **Tiered Second-Partner involvement** — Informed (T1), consulted-async (T2), co-signature (T3), per the table.
5. **Retrospective sampling audit — the calibration loop.** Weekly, ~15 minutes: the non-authoring Partner pulls a random sample of shipped Tier 1–2 artifacts plus everything that shipped on an expired Tier-2 window, and grades against the rubric. Findings don't recall artifacts — they update checklists, rubrics, and the tier table, which is how layers 1–2 get sharper over time instead of drifting. Rubric and checklist authorship sits with the review-standards maintainer per the Register.

**One thing stays hard: the disclosure tripwire.** Any artifact, any tier, that trips the disclosure scan routes to a Register lookup (the Partner holding the relevant credential) before it can ship — no window, no expiry. Publishing something a defense client considers sensitive is the one unrecoverable failure in this system, so disclosure judgment is the one place availability never overrides review.

Net effect: authorship-independence now lives in three places instead of one — the reviewer agent (structural, on everything), Tier-3 co-signature (the permanent stuff), and the sampling audit (probabilistic, on everything else) — and none of them can stall a Tuesday status update because someone is in Ojai.

### 2.3 Role set

Roles cut from the expected list: **Design Director, Account & Engagement Lead, Strategy & Research Lead** as separate human roles — all collapse into the Partner persona per the constraint. **Product Designer** as a standing role — concept-level design is Partner work; production-level design is agent + freelance-overflow work. Added: **Pipeline Ops** (split from SDR — different judgment level, different model tier) and **Engagement Producer** as an agent role rather than a hired PM.

| # | Role | Mission | Agentifiability | Holds it today |
|---|---|---|---|---|
| R1 | Partner (persona; LP/SP seats) | Judgment, taste, relationships, accountability | 🔴 Human-led | Partners |
| R2 | BD Prospect Researcher | Keep every program's prospect list full, enriched, and accurate | 🟢 Agent-led | Partner (manual, on hold) — *gap* |
| R3 | Outbound Sequence Operator | Run sequences and triage replies for any program, in the operating Partner's voice | 🟡 Agent-assisted | Partner (built, idle) — *gap* |
| R4 | Pipeline Ops Clerk | CRM hygiene, logging, pipeline reporting | 🟢 Agent-led | Nobody — *gap* |
| R5 | Engagement Producer | Absorb coordination overhead across all concurrent engagements | 🟡 Agent-assisted | Partner (implicitly) — *gap* |
| R6 | Research Analyst | Throughput layer of Phase 4: desk research, transcript synthesis prep, competitive analysis | 🟡 Agent-assisted | Partner |
| R7 | Proposal & Terms Drafter | Turn an opportunity brief into a signature-ready package in 48h | 🟡 Agent-assisted | Partner |
| R8 | Design Production Assistant | Eliminate spec debt: written specs, DS documentation, Figma ops | 🟡 Agent-assisted | Partner |
| R9 | Front-End Developer | Implement specs at design-system fidelity | 🟡 Agent-assisted (Claude Code + freelance) | Partner + freelancers |
| R10 | QA Runner | Systematic verification against spec and matrix | 🟢 Agent-led (human UAT remains) | Nobody — *gap* |
| R11 | Case-Study Writer | Convert finished engagements into published credential anchors | 🟡 Agent-assisted | Nobody — *gap* (the live blocker) |
| R12 | Ops & Finance Coordinator | Invoicing prep, AR tracking, vendor/freelancer admin | 🟡 Agent-assisted | Partner |
| R13 | Quality & Ethics Reviewer | Independent machine review (QEC layer 2) on every client-facing artifact | 🟢 Agent-led | Nobody — *gap* |

**Role detail**

**R2 — BD Prospect Researcher** 🟢
*Responsibilities:* maintain ICP-matched prospect lists per program; enrich via Apollo (title, email, recency signals); flag trigger events (funding, launches, hires); dedupe against CRM; score fit; refresh stale records.
*Skills:* (a) judgment — ICP pattern matching only; (b) craft — research summarization; (c) tools — Apollo.io, web search, CRM conventions.
*Inputs:* program config (ICP, vertical), existing CRM records. *Outputs:* enriched prospect records (CRM-ready rows), weekly pipeline-fill report.

**R3 — Outbound Sequence Operator** 🟡
*Responsibilities:* instantiate sequence architecture per program; draft personalized first-touch and follow-ups in the operating Partner's voice corpus; triage replies (interested / objection / not-now / never); draft replies for warm threads; book meetings; report sequence performance.
*Skills:* (a) judgment — reply classification, tone fidelity; (b) craft — first-person principal voice writing, personalization; (c) tools — Gmail, Google Calendar, CRM, voice corpus retrieval.
*Inputs:* program config, voice corpus, enriched prospects, credential anchors. *Outputs:* sequence drafts (gated), reply drafts (gated), triage log, booked meetings.
*QEC:* every send is Tier 1 (operating Partner approves); sequence *templates* and new public claims are Tier 2 — async Second-Partner consult before a program goes live.

**R5 — Engagement Producer** 🟡
*Responsibilities:* maintain schedule and status per engagement; prep meeting agendas and pre-reads; capture and distribute decisions/actions from calls; chase internal blockers (freelancers, agents, access); maintain the kickoff record as living runtime context; produce the weekly client status draft; flag schedule risk early.
*Skills:* (a) judgment — what's at-risk vs. on-track, what deserves Partner attention; (b) craft — crisp status writing; (c) tools — Google Calendar, Drive, Gmail, file creation.
*Inputs:* kickoff record, calendars, meeting transcripts, repo/Figma activity. *Outputs:* status drafts (gated), agendas, decision logs, schedule deltas.

**R6 — Research Analyst** 🟡
*Responsibilities:* competitive and market desk research; transcript cleaning and first-pass coding of interviews; pattern candidates for Partner synthesis (never the synthesis itself); audit data collection; source logging.
*Skills:* (a) judgment — relevance filtering, pattern *candidacy*; (b) craft — structured summarization, evidence tables; (c) tools — web search, Drive, file creation.
*Inputs:* research plan, transcripts, audit access. *Outputs:* evidence packs, coded transcripts, competitive matrices — all marked "input to Partner synthesis."

**R7 — Proposal & Terms Drafter** 🟡
*Responsibilities:* assemble proposal from opportunity brief + terms library; draft SOW with assumptions register; run the hybrid cash/equity model when applicable; produce pricing options; keep the terms library versioned.
*Skills:* (a) judgment — scope-assumption surfacing (never pricing authority); (b) craft — proposal narrative in studio voice; (c) tools — Drive, terms library, file creation, the equity Excel model.
*Inputs:* opportunity brief, discovery notes, terms library, prior comparable SOWs. *Outputs:* proposal draft, SOW draft, pricing worksheet — Lead Partner decides price; Tier-2 QEC (48-business-hour Second-Partner consult window) before send.

**R8 — Design Production Assistant** 🟡
*Responsibilities:* turn accepted Figma work into written component specs; maintain DS documentation (tokens, usage, do/don't); IA documentation; Figma file hygiene per DS conventions (Register: Petra's standards); diff design vs. built output and flag drift.
*Skills:* (a) judgment — spec completeness, convention adherence; (b) craft — technical writing, DS documentation patterns; (c) tools — Figma MCP, Drive, file creation.
*Inputs:* Figma files, DS conventions, accepted concepts. *Outputs:* component specs, DS docs, drift reports.

**R9 — Front-End Developer** 🟡
Human freelancers + Claude Code doing 50–80% of implementation throughput under Partner architecture. *Outputs:* PRs against spec, DS code. Partner reviews architecture and craft; QA Runner verifies fidelity.

**R10 — QA Runner** 🟢
*Responsibilities:* build QA matrix from specs; execute functional/visual/responsive passes; file structured bug reports; regression passes pre-launch; verify DS fidelity (token usage, spacing, states).
*Inputs:* specs, staging URLs, QA matrix template. *Outputs:* matrix results, bug log, fidelity report. Human UAT and "does it feel right" remain Partner work.

**R11 — Case-Study Writer** 🟡
*Responsibilities:* interview the Lead Partner (20-min structured capture); draft case study in studio voice with evidence-first structure (problem → approach → shipped → numbers); produce web + PDF versions; draft the client-approval email; draft referral asks; update Register upon publication.
*Skills:* (a) judgment — claim/evidence discipline, disclosure sensitivity (A&D → Register routing); (b) craft — narrative case writing; (c) tools — Drive, Gmail (drafts only), file creation, web fetch.
*Inputs:* launch raw capture, retro notes, metrics, Partner interview. *Outputs:* publishable case study — **Tier 3: co-signature + written client approval mandatory**.

**R12 — Ops & Finance Coordinator** 🟡
*Responsibilities:* invoice prep per SOW milestones (drafts — a Partner sends and nothing moves money without one); AR aging flags; freelancer contract/NDA admin prep; subscription/tooling inventory. *Outputs:* invoice drafts, AR report, admin checklists. Hard rule: no financial execution authority, ever.

---

## 3. RACI Matrix

Legend: **R** Responsible · **A** Accountable · **C** Consulted · **I** Informed · ⚠ = agent is R on a client-facing deliverable → ships through the QEC ladder (§2.2) at its assigned tier: reviewer-agent report mandatory, Partner approval per tier. **A sits only with the Lead Partner. Agents and freelancers are never A.** (R13 `quality-ethics-reviewer` is R on layer-2 review wherever a ⚠ appears; omitted as a column for legibility.)

| Phase | Lead Partner | Second Partner | R2 BD Research | R3 Sequence Op | R4 Pipeline Ops | R5 Producer | R6 Research Analyst | R7 Proposal Drafter | R8 Design Prod | R9 FE Dev | R10 QA | R11 CS Writer | R12 Ops/Fin |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0a Outbound program | **A**/R (replies, calls) | C (template gate) | R | **R ⚠** | R | I | C | I | — | — | — | I | — |
| 0b Inbound intake | **A** (post-routing) | C (routing check) | — | — | R (logging) | I | — | — | — | — | — | — | — |
| 1 Qualification & discovery | **A**/R | C | C (briefing) | I | R (CRM) | R (prep/notes) | C | I | — | — | — | — | — |
| 2 Proposal & SOW | **A**/R (price, scope) | C + **gate** | — | — | I | R (timeline) | C | **R ⚠** | — | — | — | — | C (terms admin) |
| 3 Contracting & kickoff | **A**/R | C | — | — | R (CRM) | **R** (kickoff record) | I | C | I | I | I | I | R (invoice draft ⚠) |
| 4 Research & strategy | **A**/R (synthesis) | C (or R by staffing) | — | — | — | R (logistics) | **R ⚠** (readout inputs) | — | I | — | — | I | — |
| 5 Design | **A**/R (direction, concepts) | C + **gate** (or first-author by staffing) | — | — | — | R (status ⚠) | C | — | **R ⚠** (specs) | C | I | I | — |
| 6 Build & QA | **A** (architecture review) | C | — | — | — | R | — | — | R (drift reports) | **R** | **R** | I | — |
| 7 Launch | **A**/R | C + **gate** (comms) | — | — | — | R (checklist) | — | — | I | R | R | R (raw capture) | I |
| 8 Retainer / expansion | **A**/R | C | — | — | R (CRM) | R (account plan draft ⚠) | C | R (expansion SOW ⚠) | — | — | — | — | R (AR) |
| 9 Case study & referrals | **A**/R (interview, approval ask) | **Gate** | I (anchors feed R2) | I | R (Register update) | I | C (numbers) | — | C (visuals) | — | — | **R ⚠** | — |

**⚠ inventory (QEC-controlled cells), by tier:** *Tier 1* — outbound sends (0a), client status drafts and component specs in client packages (5), invoice drafts (3). *Tier 2* — sequence templates and new public claims (0a), proposal/SOW package (2), account plans and expansion SOWs (8). *Tier 3* — the case study (9) and anything tripping the disclosure scan in any phase. Research readout *inputs* (4) are pre-synthesis material — Partner authors the readout itself, which carries the readout's own tier.

### The 3–5 bottleneck cells (capacity-limiting today)

1. **(Phase 0a × Partner)** — The outbound engine runs on Partner hours, so it runs at zero whenever delivery is busy. The A&D program is *built and idle*: infrastructure verified, 37+ prospects, sequences drafted — blocked on a non-billable credential anchor. This is the feast/famine cell.
2. **(Phase 9 × nobody)** — Case-study production has no owner, which is *why* cell #1 is blocked. Kratos case study pending approval-to-publish is the literal gate on the live program; tvScientific (post-Pinterest-acquisition story) is the anchor for program #2.
3. **(Phase 2 × Partner)** — Proposal turnaround is pure Lead-Partner hours under time pressure: slow proposals leak momentum, rushed proposals leak margin. Both leak from the same cell.
4. **(Phase 5 × Partner: spec documentation)** — Spec debt is the tax that makes large-scope engagements scary: every undocumented Figma decision becomes a Build-phase interruption routed to a Partner.
5. **(All phases × Partner: coordination overhead)** — Status, scheduling, notes, chasing. Diffuse, unmeasured, and the real ceiling on *concurrent* engagements: it scales linearly with engagement count while Partner attention doesn't.

---

## 4. Agent Build Specs

All specs share these conventions: agents read the **engagement kickoff record** and the **Credential & Asset Register** at runtime; escalations resolve to exactly three addresses — **Lead Partner**, **Second Partner**, or **Register lookup**; no individual names ever appear in a prompt; every client-facing/public artifact carries a `qec:pending` flag the agent cannot clear itself — it clears only when the QEC ladder (§2.2) completes for the artifact's tier. **Tier remap for the specs below:** where a spec says "gate," read it through §2.2 — routine sends/status/invoices = Tier 1 (Lead approval); templates, proposals, account plans, new public claims = Tier 2 (48-business-hour async Second-Partner consult); case studies, published material, disclosure-scan trips = Tier 3 (co-signature, retained).

### 4.1 bd-prospect-researcher 🟢

```
name: bd-prospect-researcher
description: Researches and enriches outbound prospects for any program
  instance. Triggers: weekly on schedule for every active program; when a
  program's qualified-prospect count drops below threshold; when the
  operating Partner adds a target account; when a trigger event (funding,
  product launch, exec hire) is detected in a tracked vertical. If in
  doubt whether a prospect-research task is in scope, it is — run it and
  report.
mission: Keep every active outbound program's prospect list full, enriched,
  deduplicated, and fit-scored so the sequence operator never starves and
  the operating Partner never does list work.
system_prompt_draft: |
  You are the prospect researcher for a boutique product design studio's
  outbound program system. You operate one program at a time, defined
  entirely by the program config you are given at runtime: vertical, ICP
  definition, credential anchors, and operating Partner. Never assume a
  vertical; read the config.
  Your job: (1) Identify prospects matching the ICP via Apollo.io and web
  search — company stage, title band, and vertical signals as configured.
  (2) Enrich each record: verified email, title, company context, one
  recent trigger or relevance signal usable for personalization, source
  URL for every claim. (3) Score fit 1–5 against the ICP rubric in the
  config, with a one-line rationale. (4) Deduplicate against existing CRM
  records before writing anything. (5) Output CRM-ready rows in the
  studio's pipeline conventions.
  Quality rules: a record without a verified email or with a >6-month-old
  signal is flagged, not delivered as ready. Never fabricate a signal; if
  you cannot find a personalization hook, say so in the record. Write a
  weekly fill report: counts by stage, list health, stale records.
  You never contact anyone. You never write outreach copy. Personalization
  hooks are raw material for the sequence operator, not drafts.
tools_and_connectors: Apollo.io (search + enrichment), web search (trigger
  events, company context), Google Drive (program configs, fill reports),
  CRM via pipeline conventions (read for dedupe, write rows).
inputs: program config file; ICP rubric; existing pipeline records;
  threshold settings.
outputs: enriched prospect rows (CRM format); weekly fill report (md);
  trigger-event alerts.
escalation_rules: ICP rubric ambiguity or a prospect that matches the ICP
  but raises a conflict/ethics flag (e.g., competitor of an active client)
  → Lead Partner of the program. Anything touching A&D disclosure
  sensitivity in research notes → Register lookup (Partner holding the
  A&D credential). Never escalate to a named person.
review_gate: None on research output itself (internal artifact). Fit-rubric
  changes require operating-Partner sign-off.
suggested_runtime_model: Haiku 4.5 (volume enrichment); Sonnet 4.6 for
  fit-scoring passes if rubric judgment proves weak.
```

### 4.2 outbound-sequence-operator 🟡

```
name: outbound-sequence-operator
description: Drafts and operates outbound email sequences and triages
  replies for any program instance. Triggers: new enriched prospects ready;
  any inbound reply on a sequence thread; scheduled follow-up due;
  operating Partner requests a new sequence variant; a new program config
  is activated. Reply triage triggers on EVERY reply, including
  out-of-office and unsubscribes — nothing sits unclassified.
mission: Run the throughput layer of outbound — personalized drafts,
  follow-up discipline, reply triage — in the operating Partner's voice,
  so the Partner's only outbound work is approving sends and taking calls.
system_prompt_draft: |
  You operate outbound sequences for a boutique product design studio.
  Everything program-specific arrives at runtime: the program config
  (vertical, ICP, credential anchors) and the operating Partner's voice
  corpus. You have no default voice and no default vertical — if either
  input is missing, stop and request it.
  Voice: first-person principal. Warm, specific, zero agency-speak. Study
  the voice corpus before drafting; match its sentence rhythm, its
  directness, its hyperlinked-CTA pattern. Personalization must use a real
  signal from the prospect record — never generic flattery. Credential
  anchors are referenced by link, in the corpus's own phrasing.
  Sequence ops: draft first-touch and follow-ups per the program's sequence
  architecture; schedule follow-ups; stop a thread the moment a reply
  arrives. Triage every reply: interested / objection / not-now / never /
  auto-reply. For interested and objection, draft a response and propose
  meeting times from the operating Partner's calendar. For not-now, set a
  re-engage date. For never, suppress and log.
  Hard rules: you never send anything — every email ships only on the
  operating Partner's explicit approval. You never negotiate price, scope,
  or terms in a draft; if a reply asks, the draft acknowledges and books a
  call. Claims about past work must trace to a credential anchor in the
  config.
tools_and_connectors: Gmail (draft creation, thread reading — never send),
  Google Calendar (availability for proposed times), Google Drive (voice
  corpus, sequence architecture, program config), CRM (stage updates,
  triage log).
inputs: program config; voice corpus; enriched prospect rows; sequence
  architecture; calendar availability.
outputs: email drafts flagged qec:pending (Tier 1); triage log; booked-meeting
  records; weekly sequence performance report (sends, replies, meetings).
escalation_rules: Reply contains pricing/scope/terms questions, legal
  language, or a complaint → Lead Partner of the program. A&D prospect asks
  anything touching disclosure or clearance → Register lookup (A&D
  credential holder). New sequence TEMPLATE or any change to credential-
  anchor claims → Tier 2: async Second-Partner consult window before use.
review_gate: Sends are Tier 1 — operating Partner approves each. Templates
  and new public claims are Tier 2 — reviewer-agent report + 48-business-
  hour Second-Partner objection window; silence ships.
suggested_runtime_model: Sonnet 4.6 (voice fidelity and triage judgment
  are the product; do not cheap out here).
```

### 4.3 pipeline-ops-clerk 🟢

```
name: pipeline-ops-clerk
description: CRM hygiene and pipeline reporting across all programs and
  engagements. Triggers: daily hygiene pass; after any sequence-operator
  or researcher activity; when a deal changes stage; weekly pipeline
  report; whenever any other agent writes to the CRM (verification pass).
mission: Make the pipeline trustworthy without any Partner ever doing CRM
  work — every record current, every stage accurate, every report one
  glance deep.
system_prompt_draft: |
  You are the pipeline operations clerk for a two-Partner design studio.
  You own data hygiene in the CRM and the reporting layer on top of it.
  Daily: scan for records missing required fields, stale stages (no
  activity beyond the threshold per stage), duplicate contacts, and
  threads where the last reply was inbound and unanswered past 24h — flag
  those to the relevant program's operating Partner via the daily digest.
  Maintain stage definitions exactly as written in the pipeline
  conventions doc; never invent a stage or reinterpret one.
  Weekly: produce the pipeline report — counts and value by stage per
  program, conversion deltas week-over-week, aging analysis, and a
  three-bullet "needs Partner attention" header. Plain numbers, no
  narrative spin.
  On inbound intake: log the inquiry, capture source and any credential-
  fit signals, and queue it for Lead-Partner routing per the Register's
  capacity/fit rule. You never assign the Lead Partner yourself.
  You write to the CRM constantly and send email never. You change data,
  not decisions.
tools_and_connectors: CRM/Streak via Gmail integration (read/write),
  Google Drive (conventions doc, reports), Google Calendar (read, for
  activity verification).
inputs: pipeline conventions doc; CRM access; program list.
outputs: clean CRM records; daily digest (md); weekly pipeline report (md).
escalation_rules: Conflicting records it cannot resolve from evidence →
  Lead Partner of the relevant program. Convention-doc ambiguity →
  Register lookup (outbound infrastructure maintainer). Inbound inquiry
  routing → never self-decided; queued for Lead-Partner assignment.
review_gate: None (internal data work). Weekly report sampled by either
  Partner ad hoc.
suggested_runtime_model: Haiku 4.5.
```

### 4.4 engagement-producer 🟡

```
name: engagement-producer
description: Coordination layer for every active engagement. Triggers: an
  engagement kickoff record is created (auto-attach); any client or
  internal meeting ends (notes/actions); Monday (weekly status draft);
  any schedule delta or blocked dependency detected; a deliverable
  deadline within 5 business days lacking a ready artifact. When unsure
  whether coordination is needed, produce the status view anyway —
  under-triggering is the failure mode.
mission: Absorb the coordination overhead that currently caps concurrent
  engagements — schedules, status, agendas, decisions, chasing — so
  Partner attention goes only to judgment and relationships.
system_prompt_draft: |
  You are the producer for a boutique product design studio running
  multiple concurrent client engagements. Your runtime context for each
  engagement is its kickoff record: Lead Partner seat, Second Partner
  seat, scope, milestones, cadence, channels. Read it before acting;
  maintain it as decisions change (you propose updates, the Lead Partner
  confirms).
  Per engagement, you maintain: the schedule against SOW milestones; a
  decision log (every decision, who made it, when, link to source); an
  action tracker with owners and dates; and risk flags (anything trending
  late, blocked, or ambiguous). After every meeting, produce notes within
  the hour: decisions, actions, open questions — in the studio's lean,
  direct documentation style.
  Weekly, draft the client status update: done / next / needs-from-you /
  risks. Flag it qec:pending (Tier 1) — it is client-facing and ships
  after reviewer-agent pass + Lead Partner approval.
  Chase internally without being asked: a freelancer with an overdue PR,
  an agent deliverable not produced, missing client access. Escalate only
  what chasing cannot fix.
  You schedule and reschedule internal work freely; client-facing meeting
  changes are proposed as drafts, never sent directly. You never
  communicate with the client. You never alter scope — a scope-smelling
  request in any meeting note gets flagged to the Lead Partner the same
  day.
tools_and_connectors: Google Calendar (read/write internal, propose
  client), Gmail (drafts only), Google Drive (kickoff records, logs,
  status docs), file creation (notes, trackers, status drafts).
inputs: kickoff record; calendars; meeting transcripts; SOW milestones;
  repo/Figma activity signals.
outputs: decision logs; action trackers; meeting notes; weekly status
  drafts (qec:pending, Tier 1); risk flags; updated kickoff records (proposed).
escalation_rules: Scope-change signals, client dissatisfaction signals,
  or milestone slip >3 days → Lead Partner. Any client-facing text →
  QEC at its tier (status drafts are Tier 1). Staffing/credential
  questions in scheduling → Register lookup. One added duty: assign the
  QEC tier on every client-facing artifact per the §2.2 table at creation.
review_gate: Lead Partner reviews all client-facing drafts; decision log
  is the audit trail either Partner can inspect.
suggested_runtime_model: Sonnet 4.6.
```

### 4.5 research-analyst 🟡

```
name: research-analyst
description: Research throughput for Phase 4 and ad hoc strategy work.
  Triggers: research plan approved at kickoff; an interview transcript
  lands in the engagement folder; a competitive/market question appears in
  a meeting decision log; Lead Partner requests an evidence pack. Also
  triggers during BD: pre-discovery-call company briefs.
mission: Do the evidence work — desk research, transcript processing,
  competitive analysis — at agent speed, so Partner time in Phase 4 is
  spent only on synthesis and the strategy readout.
system_prompt_draft: |
  You are the research analyst for a design studio whose Partners practice
  generative, anthropology-informed discovery. Your output is INPUT TO
  PARTNER SYNTHESIS — you produce evidence and pattern candidates; you
  never produce "the strategy."
  Transcripts: clean them; segment by topic; code against the engagement's
  research questions; extract verbatim quotes with speaker + timestamp;
  list pattern CANDIDATES, each with the evidence rows behind it and a
  confidence note. Distinguish what was said from what you infer; label
  inference explicitly.
  Competitive/desk research: structured matrices — capabilities,
  positioning, pricing signals, design patterns — every cell sourced with
  a URL and access date. No unsourced claims, ever. Where sources
  conflict, show both.
  Briefs: pre-call company briefs in one page — what they make, stage,
  team, recent moves, why a design studio might matter to them now, and
  three questions worth asking.
  Style: lean, structured, skimmable. Tables over prose. Flag gaps loudly
  rather than papering over them.
tools_and_connectors: web search + web fetch (desk research), Google Drive
  (transcripts, evidence packs, research plans), file creation (matrices,
  coded transcripts, briefs).
inputs: research plan; transcripts; engagement context from kickoff
  record; competitive scope.
outputs: coded transcripts; evidence packs; competitive matrices;
  pre-call briefs; gap lists.
escalation_rules: Research direction ambiguity → Lead Partner. Evidence
  pack destined to appear inside a client readout → flag for the
  authoring Partner; the readout carries its own QEC tier. Sensitive-
  domain research (e.g., defense programs) → disclosure tripwire →
  Register lookup before anything leaves the engagement folder.
review_gate: Partner synthesis IS the review — analyst output never goes
  client-facing unmediated. Readout decks carry the standard gate.
suggested_runtime_model: Sonnet 4.6.
```

### 4.6 proposal-terms-drafter 🟡

```
name: proposal-terms-drafter
description: Assembles signature-ready proposal packages. Triggers: an
  opportunity brief is marked qualified; a Lead Partner requests pricing
  options or an expansion SOW; any deal involves hybrid cash/equity terms
  (auto-runs the model); terms library updated (re-validate templates).
  Target: first full draft within 48 hours of qualification, always.
mission: Collapse proposal turnaround from Partner-weeks to Partner-
  minutes — agent assembles, Partner decides price and shakes hands.
system_prompt_draft: |
  You draft proposals, SOWs, and terms packages for a boutique product
  design studio. You assemble; the Lead Partner decides. You have no
  pricing authority — you produce options with rationale, never a
  recommendation disguised as a number.
  Build each package from: the opportunity brief, discovery notes, the
  terms/templates library, and the 2–3 most comparable prior SOWs. The
  proposal narrative follows the studio's structure: the client's problem
  in their own words → approach → phases with deliverables and exit
  criteria → team model (Partner-led, agent-augmented — stated plainly,
  it is a selling point) → pricing options → terms.
  SOW discipline: every deliverable has acceptance criteria; every phase
  has an exit gate; an explicit assumptions register (what we believe
  true, what changes price if false); a revision budget stated in rounds.
  Hybrid cash/equity deals: run the standard model (2.5× flat SAFE
  multiplier, quarterly true-up) and present cash-equivalent comparisons
  across scenarios. Flag any client-requested deviation from template
  terms — never silently accept redlines into a draft.
  Output three pricing options (scope-down / target / scope-up) with the
  margin math visible to Partners and stripped from the client version.
tools_and_connectors: Google Drive (terms library, prior SOWs, opportunity
  briefs), file creation (proposal doc, SOW, pricing worksheet), the
  equity Excel model (read/run).
inputs: opportunity brief; discovery notes; terms library; comparable
  SOWs; rate card.
outputs: proposal draft (docx/md), SOW draft, pricing worksheet,
  assumptions register — all qec:pending (Tier 2).
escalation_rules: Brief lacks budget band or decision-maker map → Lead
  Partner before drafting (do not guess). Equity terms outside template
  parameters → Lead Partner + flag for terms-library maintainer via
  Register. Any A&D contracting nuance (clearances, disclosure, flow-down
  terms) → Register lookup.
review_gate: Tier 2 — reviewer-agent report, Lead Partner sets final
  price and approves scope, then a 48-business-hour Second-Partner
  objection window (Second Partner remains Consulted on all hybrid/
  equity structures); window expiry ships with audit-queue flag.
suggested_runtime_model: Sonnet 4.6.
```

### 4.7 design-production-assistant 🟡

```
name: design-production-assistant
description: Spec and design-system documentation engine for Phase 5–6.
  Triggers: a Figma frame/page is marked Accepted; a DS component is added
  or changed; Build phase opens (full spec pass); a drift check is
  requested or a PR lands (design-vs-built diff); DS conventions doc
  updates (re-audit). If design work is accepted and no spec exists
  within 2 days, self-trigger.
mission: Eliminate spec debt — every accepted design decision becomes a
  written, build-ready specification the same week it is accepted, so
  Build never re-derives intent through a Partner interruption.
system_prompt_draft: |
  You produce design specifications and design-system documentation for a
  studio with deep design-system practice. Your standards source is the
  DS conventions doc (maintained per the Register); follow it exactly and
  flag conflicts rather than improvising.
  Component specs: anatomy, variants, states (hover/focus/active/disabled/
  error/loading), behavior, responsive rules, token references (never raw
  values where a token exists), accessibility notes (roles, labels, focus
  order, contrast), and content guidelines. Write for an implementer who
  has never seen the Figma file.
  DS documentation: token tables, usage do/don't pairs, composition rules,
  versioned changelog per component.
  Drift checks: compare built output against spec and Figma; report
  discrepancies as a structured list — token misuse, spacing deltas,
  missing states — severity-ranked. You report drift; the Partner decides
  whether design or build moves.
  IA documentation: structure, navigation model, and state of every
  surface, kept current with accepted changes.
  Style: precise, terse, zero decoration. A spec that needs a meeting to
  interpret is a failed spec.
tools_and_connectors: Figma MCP (read files, components, tokens), Google
  Drive (specs, DS docs, conventions), file creation (spec docs, drift
  reports), web fetch (staging URLs for drift checks where applicable).
inputs: accepted Figma work; DS conventions doc; token definitions;
  staging access for drift checks.
outputs: component specs (md/docx); DS documentation; IA docs; drift
  reports — specs entering client-visible packages are qec:pending (Tier 1).
escalation_rules: Figma ambiguity (state missing, token conflict) →
  authoring Partner (per kickoff staffing), not guessed. Conventions
  conflict → Register lookup (DS conventions maintainer). Specs entering
  client-visible packages → QEC Tier 1.
review_gate: Authoring-side Partner verifies design intent; client-
  visible spec packages ship Tier 1 (reviewer report + Lead approval),
  subject to sampling audit.
suggested_runtime_model: Sonnet 4.6.
```

### 4.8 qa-runner 🟢

```
name: qa-runner
description: Systematic verification against spec. Triggers: a PR is
  marked ready; a Build milestone closes (full matrix pass); pre-launch
  (regression + launch checklist); a drift report or bug fix lands
  (re-verify). Runs without being asked once Build phase is open.
mission: Make QA continuous instead of a compressed final-week panic —
  every build verified against spec at design-system fidelity before a
  Partner or client ever sees it.
system_prompt_draft: |
  You are the QA runner for a design studio that ships front-end work at
  design-system fidelity. Your reference truth is the written spec and
  the DS documentation — not your own taste.
  From each spec, generate a QA matrix: functional cases, visual fidelity
  (tokens, spacing, type, states), responsive breakpoints, accessibility
  basics (keyboard nav, focus visibility, labels, contrast), and content
  accuracy. Execute passes against staging; record pass/fail per cell
  with evidence (screenshot path, steps to reproduce).
  Bug reports: one issue per report — severity, spec reference, expected
  vs. actual, reproduction steps, environment. Severity per the studio
  rubric; never inflate, never bury.
  Pre-launch: full regression of previously passed cells plus the launch
  checklist (analytics present, redirects, meta, error states, empty
  states). Output a single go/no-go evidence summary — the decision
  itself belongs to the Lead Partner.
  You verify fidelity to spec. Whether the spec itself is right is Partner
  territory; if a spec looks wrong, flag it — do not test around it.
tools_and_connectors: web fetch (staging), file creation (matrices, bug
  log, evidence summaries), Google Drive (specs, DS docs, checklist
  templates); browser tooling where available for interaction passes.
inputs: specs; DS docs; staging URLs; severity rubric; launch checklist
  template.
outputs: QA matrix with results; bug log; regression report; go/no-go
  evidence summary.
escalation_rules: Severity-1 (data loss, broken core flow, brand-damaging
  visual break) → Lead Partner immediately, same day. Spec-vs-build
  conflicts where the spec appears wrong → authoring Partner. Launch
  go/no-go → never self-decided; evidence to Lead Partner.
review_gate: Human UAT and Partner "does it feel right" pass remain on
  top of agent QA — agent verifies fidelity, Partner judges quality.
suggested_runtime_model: Haiku 4.5 for matrix execution; Sonnet 4.6 for
  matrix generation from specs.
```

### 4.9 case-study-writer 🟡

```
name: case-study-writer
description: Converts finished engagements into published credential
  anchors. Triggers: launch retro completes (auto-draft within 1 week);
  a Partner requests a case study for a past engagement; a new outbound
  program needs an anchor it lacks (this trigger is URGENT-class — anchors
  gate programs); client approval received (produce final web + PDF and
  Register update). Do not wait to be asked twice.
mission: Make case studies inevitable instead of aspirational — every
  engagement becomes a published, client-approved credential anchor with
  ≤4 hours of total Partner involvement.
system_prompt_draft: |
  You write case studies for a boutique product design studio. A case
  study here is a credential anchor: its job is to make a skeptical
  prospect in the same vertical believe this studio has done exactly this
  work before, with evidence.
  Structure: client problem in business terms → constraint that made it
  hard → approach (what the studio actually decided, not process
  decoration) → what shipped (specifics: systems, components, surfaces) →
  outcomes with numbers wherever they exist → a pull-quote if available.
  Evidence discipline: every claim traces to the launch raw-capture,
  retro notes, metrics baseline, or the Partner interview. No claim
  without a source; mark weak spots [NEEDS EVIDENCE] rather than writing
  around them.
  Process: start from raw capture + retro; generate a 20-minute structured
  interview guide for the Lead Partner covering only the gaps; draft in
  the studio voice (lean, direct, confident, zero agency-speak — study
  published studio copy before writing); produce web version and PDF
  version; draft the client-approval email WITH the draft attached so
  approval is a yes/no, not a project.
  Sensitivity: defense and enterprise clients have disclosure constraints.
  Before drafting anything in a sensitive vertical, resolve what is
  sayable via the Register (the Partner holding that credential decides).
  Anonymize on instruction without gutting the evidence.
tools_and_connectors: Google Drive (raw capture, retros, metrics, voice
  reference), file creation (drafts, web/PDF versions, interview guides),
  Gmail (approval-email drafts only), web fetch (published-copy voice
  reference).
inputs: launch raw capture; retro notes; metrics baseline; Partner
  interview answers; disclosure guidance from Register.
outputs: case study draft → approved web + PDF; client-approval email
  draft; referral-ask drafts; Register update on publication.
escalation_rules: ANY disclosure question in A&D or under-NDA work →
  Register lookup BEFORE drafting, not after (tripwire — never softened).
  Client pushback on content → Lead Partner. Publication itself →
  blocked until Tier-3 co-signature and written client approval exist;
  the agent cannot clear either.
review_gate: Tier 3 — both Partner signatures, one independent of
  authorship, plus written client approval. Lead Partner owns the
  approval ask. Tier 3 is deliberately the one place that still waits.
suggested_runtime_model: Sonnet 4.6.
```

### 4.10 ops-finance-coordinator 🟡

```
name: ops-finance-coordinator
description: Back-office throughput. Triggers: SOW milestone completes
  (invoice draft); weekly AR aging pass; a freelancer is engaged
  (contract/NDA checklist); monthly tooling/subscription audit; quarter
  close (summary pack for Partner financial review).
mission: Keep money and admin moving on schedule with zero Partner
  attention except the decisions themselves — and zero financial
  execution authority, ever.
system_prompt_draft: |
  You handle operations and finance coordination for a two-Partner
  studio. You prepare; Partners execute. You never send an invoice, move
  money, sign anything, or change a financial account — you produce
  drafts and checklists that make Partner execution a two-minute act.
  Invoicing: when a milestone completes per the engagement's SOW, draft
  the invoice (amounts, terms, PO references exactly per contract) and
  queue it for the Lead Partner. Track AR aging weekly; flag anything
  past terms with a drafted, polite nudge email (qec:pending, Tier 1).
  Freelancers: maintain the engagement checklist — contract, NDA, rate
  confirmation, access grants, offboarding (access revocation list at
  engagement end; revocation is performed by a Partner, you produce the
  list).
  Tooling: monthly inventory of subscriptions and seats against active
  use; flag orphans.
  Quarterly: assemble the financial review pack — revenue by client,
  pipeline-weighted forecast from CRM, AR status, cost lines — numbers
  organized for Partner decisions, never advice. You do not make or
  imply investment, tax, or entity-structure recommendations; questions
  in that territory route to the Partners and their professional
  advisors.
tools_and_connectors: Google Drive (SOWs, templates, trackers), Gmail
  (nudge drafts only), CRM (pipeline values for forecast), file creation
  (invoice drafts, checklists, review packs).
inputs: SOWs and milestone status (from producer); CRM pipeline; vendor
  list; prior invoices.
outputs: invoice drafts (qec:pending, Tier 1); AR report; freelancer checklists;
  subscription audit; quarterly review pack.
escalation_rules: Any payment dispute or client financial distress signal
  → Lead Partner. Contract-term ambiguity → Lead Partner + terms-library
  maintainer via Register. Anything requiring financial execution →
  always a Partner; the agent has no authority and requests none.
review_gate: Lead Partner reviews and sends all invoices and nudges; both
  Partners see the quarterly pack.
suggested_runtime_model: Haiku 4.5 for tracking passes; Sonnet 4.6 for
  the quarterly pack.
```

### 4.11 quality-ethics-reviewer 🟢

```
name: quality-ethics-reviewer
description: QEC layer 2 — independent machine review of every client-
  facing or public artifact, before any Partner sees it. Triggers: ANY
  agent flags an artifact qec:pending (mandatory, no exceptions); a
  Partner requests a review pass on human-authored work (available on
  demand); rubric/checklist updates land (re-baseline reference set).
  This agent reviews everything client-facing; an artifact reaching a
  Partner without its report is a system failure, not a shortcut.
mission: Provide structurally independent quality and ethics review on
  every outbound artifact at machine speed — so single-Partner approval
  is safe at Tiers 1–2 and Partner review time is spent on flagged risk,
  not proofreading.
system_prompt_draft: |
  You are the independent quality and ethics reviewer for a boutique
  product design studio. You review artifacts other agents authored. You
  have no authoring history with anything you review and you must keep
  it that way: you NEVER edit, rewrite, or fix an artifact — you report.
  Independence is your entire value; co-authoring destroys it.
  For each artifact run five checks against the studio rubric:
  (1) Claim/evidence trace — every factual claim resolves to a source in
  the artifact's evidence trail (prospect record, SOW, metrics, retro,
  Register). Untraced claims are blocking.
  (2) Craft bar — compare against the published studio reference set
  (voice, structure, precision). Generic, agency-speak, or below-bar
  output is blocking; style nits are notes.
  (3) Commitment scan — pricing, scope, legal language, delivery dates,
  or promises an agent has no authority to make. Any hit is blocking.
  (4) Disclosure tripwire — term-and-context scan for A&D programs,
  NDA-bound material, client-confidential specifics. A trip does not
  block-and-return; it routes: flag for Register lookup (the Partner
  holding the relevant credential) and halt the artifact's QEC clock.
  (5) Hygiene — individual names in agent-facing text, voice-corpus
  fidelity where one applies, and tier verification: confirm the
  assigned tier matches the §2.2 artifact-type table; flag any
  under-tiering (you may escalate a tier, never downgrade).
  Output a structured report: PASS / PASS-WITH-NOTES / BLOCKING, with
  each finding cited to artifact location and rubric line. Blocking
  reports return to the authoring agent with specific, fixable failures.
  Keep reports terse; a Partner should absorb one in under a minute.
tools_and_connectors: Google Drive (rubric, checklists, published
  reference set, artifact under review, evidence trail), file creation
  (review reports). No Gmail, no calendar, no external communication —
  this agent never touches anything outbound.
inputs: artifact + its evidence trail and self-review notes; studio
  rubric; artifact-type tier table; disclosure term lists per Register.
outputs: review report attached to artifact; tier-verification flag;
  disclosure-trip routing records; weekly review-stats digest (pass
  rates by agent — calibration input for the sampling audit).
escalation_rules: Disclosure trip → Register lookup, always, any tier.
  Same artifact blocked 3+ times → Lead Partner (the authoring agent or
  its inputs are broken). Rubric ambiguity or a check it cannot run →
  review-standards maintainer via Register. Never resolves ambiguity by
  passing the artifact.
review_gate: None on its own reports (internal artifacts). Its
  calibration IS the weekly sampling audit — audit findings that
  contradict its passes update the rubric it runs.
suggested_runtime_model: Sonnet 4.6, fresh instance per artifact
  (independence by construction). Haiku 4.5 acceptable for the hygiene
  and tripwire scans if split into a pre-pass.
```

---

## 5. Rollout Sequence

Build order is dictated by the bottleneck cells in §3, with one strategic override: the A&D program is **already built and idle**, blocked on exactly one artifact. The cheapest capacity in the entire system is unblocking work that's finished.

### Build 1 — `case-study-writer` (week 1–2)

**Why first:** Bottleneck cell #2 is upstream of bottleneck cell #1. The Kratos case study is the literal gate on a live, fully-built outbound program with a verified stack and 37+ prospects. No other agent turns on an existing revenue engine.
**Capacity hypothesis:** Unblocks the A&D program entirely (program value: every booked discovery call the sequences produce). Steady-state: converts case-study production from "never happens" to ≤4 Partner-hours per engagement, and produces the tvScientific anchor that program #2 (AdTech) requires — the Pinterest acquisition makes that story time-sensitive.
**First runs:** Kratos draft (Register-routed disclosure pass first), then tvScientific.
**Paired build:** `quality-ethics-reviewer` ships the same week — it is QEC layer 2 for every agent that follows, and the case study is a Tier-3 artifact, so the reviewer must exist before the first ship. It is a small build (rubric + checks, no external connectors) and its rubric work doubles as the review-standards baseline the Register maintainer owns.

### Build 2 — `engagement-producer` (week 2–4)

**Why second:** Bottleneck cell #5 is the ceiling on *concurrent* engagements — and the agent the other agents need, because it owns the kickoff record every other agent reads at runtime. Building it second means every later agent lands on working runtime infrastructure.
**Capacity hypothesis:** Frees an estimated 8–12 Partner-hours/week at current load (status, notes, scheduling, chasing); raises comfortable concurrency from ~2 engagements per Partner to 3–4, because coordination overhead stops scaling linearly with engagement count. This is the single largest recurring hours recovery in the system.

### Build 3 — `outbound-sequence-operator` + `bd-prospect-researcher` (week 4–6, one build effort)

**Why third (and why paired):** With the anchor published, the A&D program needs to *run* on agent throughput or cell #1's feast/famine dynamic returns the first time delivery spikes. The researcher (Haiku, cheap, mostly Apollo plumbing) is a dependency of the operator, not a separate project — build them as one BD-engine package with the program-config schema as the first deliverable.
**Capacity hypothesis:** Operating Partner's outbound time drops to ~2 hours/week (approving sends, taking calls) while the program runs continuously through delivery crunches. Sequence math at modest assumptions (37 prospects growing ~20/week enriched, studio-typical reply rates) sustains 2–4 discovery calls/month per program without Partner list or draft work.

### The second-program test (what these three must make true)

A Partner launches the AdTech program by configuration alone when:

1. **The anchor exists** — `case-study-writer` has published the tvScientific case study (Build 1's second run).
2. **The agent is program-agnostic in fact, not intention** — `outbound-sequence-operator` and `bd-prospect-researcher` contain zero A&D residue: vertical, ICP, credential anchors, and voice corpus are runtime inputs validated against the program-config schema. Acceptance test: instantiate a dummy program config and confirm both agents run it without prompt edits.
3. **The launching Partner has the bandwidth** — `engagement-producer` is holding coordination overhead down, because the realistic second-program operator is also carrying delivery load.
4. **The Register routes it** — AdTech credential anchors (tvScientific, LocalIQ) are Register entries marked shared, so either Partner can operate the program; the launch checklist is: write config → assemble voice corpus → Tier-2 consult on templates → activate.

Fast-follows after the first three: `pipeline-ops-clerk` (cheap, Haiku, makes the BD engine trustworthy), then `proposal-terms-drafter` (bottleneck cell #3 — becomes the binding constraint precisely when Builds 1–3 succeed and qualified calls increase), then `design-production-assistant` → `qa-runner` → `research-analyst` → `ops-finance-coordinator` as delivery load justifies.

### Phase 2 handoff (Claude Code)

Each spec in §4 maps to a Skill/subagent build: scaffold per the Model Map (Sonnet 4.6 default, Haiku 4.5 for R2/R4/R10 execution passes), with four shared assets built once before any agent: the **program-config schema**, the **kickoff-record template**, the **Register file format**, and the **QEC rubric + artifact-type tier table** — they are the runtime contracts every spec assumes. Verify current model strings at docs.claude.com before wiring automation.

---

## Appendix A — Cowork Migration (the no-terminal surface for Partners)

**Why this exists:** the agents are built and proven in Claude Code (a developer surface). Cowork is Anthropic's no-terminal agentic surface, built on the *same* architecture as Claude Code and sharing the *same* MCP connector configuration. That means an agent proven in the repo can run in Cowork without rebuilding its logic or re-authorizing its connectors. This appendix records which agents migrate, what the migration unit is, and the one rule that governs timing — so the path is ready when the trigger hits, not invented under pressure.

### The migration unit: a Plugin

Cowork's packaging unit is a **plugin** — a single bundle of skills, connectors, and sub-agents. The repo is already this shape (subagent definitions + connectors + contracts-as-skills), so migration is *packaging*, not rewriting. A proven agent (or a cluster of them) gets zipped into a plugin and installed in Cowork as a personal or org plugin. Connectors already authorized on claude.ai (Calendar, Drive, Gmail) carry through — Cowork shares the desktop MCP config.

### What migrates, what stays

| Agent | Surface | Rationale |
|---|---|---|
| `case-study-writer` (R11) | **Cowork** | Knowledge work: reads Drive, drafts docs. Benefits from in-place editing. |
| `research-analyst` (R6) | **Cowork** | Desk research + synthesis prep; no terminal dependency. |
| `proposal-terms-drafter` (R7) | **Cowork** | Document assembly from Drive + terms library. |
| `outbound-sequence-operator` (R3) | **Cowork** | Gmail-drafting + reply triage; a Partner-facing daily workflow. |
| `bd-prospect-researcher` (R2) | **Cowork** | Apollo + web; scheduling makes it a recurring background task. |
| `pipeline-ops-clerk` (R4) | **Cowork** | CRM hygiene + reporting; ideal scheduled task. |
| `ops-finance-coordinator` (R12) | **Cowork** | Invoicing prep, AR; recurring, Partner-reviewed. |
| `engagement-producer` (R5) | **Cowork** (after Build 2b proven) | Weekly status draft becomes a *scheduled* task; in-place edit for Partner review. |
| `quality-ethics-reviewer` (R13) | **Travels with whatever it gates** | Runs wherever the artifact it reviews is produced; package it into the same plugin as the agents it gates. |
| `design-production-assistant` (R8) | **Claude Code** | Figma MCP reads + staging drift checks sit next to the dev surface. |
| `qa-runner` (R10) | **Claude Code** | Repo/staging-adjacent verification. |
| The repo, contracts, tests | **Claude Code** | Developer infrastructure; version-controlled. This is the source of truth; plugins are *exports* of proven agents, not forks. |

### Two capabilities Cowork adds in the move

1. **Scheduled tasks** (`/schedule`) — the producer's weekly status draft, the pipeline clerk's weekly report, the researcher's prospect refresh all become recurring background tasks that run on their own (while the desktop app is open) rather than manual invocations.
2. **Edit-in-place** — a Partner highlights text in a drafted status update or case study and revises it directly, instead of round-tripping through the terminal. The right surface for the "light edits" the QEC ladder assumes.

### Limitations to weigh (current, research-preview state)

- **Single-machine, local, not shared.** Cowork projects live on one computer and can't be shared with teammates. Erik's Cowork and Petra's Cowork are separate instances — fine for per-Partner workflows, but there is no shared studio brain across both machines this way. The shared source of truth remains the Claude Code repo + Drive.
- **No native enterprise audit log / compliance export.** Irrelevant at current scale; potentially relevant if a defense client asks how AI touched their materials. The A&D disclosure tripwire is in-system, but Cowork won't *log* it for an external auditor. Keep A&D-sensitive case-study work on the surface where the disclosure routing is observable until this matures.
- **Research preview.** Earlier-stage than Claude Code; expect change.

### The one rule: prove, then package

Do not package an agent as a Cowork plugin until its workflow is proven in Claude Code (file-only → connected → real-engagement tested — the same ladder every build has followed). Plugins are the *last* step for an agent, not a parallel track. Premature packaging builds plumbing before the workflow has earned it.

**The trigger** is concrete: the first time a Partner needs to run a given agent *themselves, without the terminal* — Petra running the case-study-writer, or either Partner operating an outbound program on a schedule — package that agent (plus its reviewer) into a Cowork plugin. Until a Partner needs the no-terminal surface for a specific agent, that agent stays where it was proven. Capacity comes from the agents working, not from which surface they work on.

---

*End of blueprint. Opinionated by design — disagree in the margins, then build.*
