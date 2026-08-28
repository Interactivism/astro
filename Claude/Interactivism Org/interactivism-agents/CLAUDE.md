# Interactivism Agent Infrastructure — Repo Conventions

This repo contains the runtime contracts, agent definitions, and acceptance tests for Interactivism's agent-augmented operating model.

---

## Agent Roster

| Agent | File | Purpose | Build |
|---|---|---|---|
| `quality-ethics-reviewer` | `.claude/agents/quality-ethics-reviewer.md` | Structural QEC gate on all artifacts | Build 1 |
| `case-study-writer` | `.claude/agents/case-study-writer.md` | Converts engagements into case study drafts | Build 1 |
| `engagement-producer` | `.claude/agents/engagement-producer.md` | Maintains per-engagement coordination artifacts | Build 2a |
| `bd-prospect-researcher` | `.claude/agents/bd-prospect-researcher.md` | Enriches and scores prospects per program ICP; writes fill reports | Build 3 (R2) |
| `outbound-sequence-operator` | `.claude/agents/outbound-sequence-operator.md` | Drafts sequences + triages replies in operating Partner's voice; never sends | Build 3 (R3) |
| `pipeline-ops-clerk` | `.claude/agents/pipeline-ops-clerk.md` | Daily CRM hygiene, weekly pipeline report, inbound intake queue | Build 3 (R4) |
| `research-analyst` | `.claude/agents/research-analyst.md` | Evidence processing: desk research + transcript coding for Phase 4; does NOT design/run research (→ R14) or evaluate heuristics (→ R15) | Build 4a, refactored Build 6 |
| `design-production-assistant` | `.claude/agents/design-production-assistant.md` | Turns accepted Figma work into build-ready component specs; runs drift checks; lo-fi artifact production for solution exploration | Build 4b (R8), scope note Build 6 |
| `qa-runner` | `.claude/agents/qa-runner.md` | Generates QA matrices from specs; executes against staging; produces evidence summaries | Build 4b (R10) |
| `proposal-terms-drafter` | `.claude/agents/proposal-terms-drafter.md` | Assembles signature-ready proposal/SOW packages from opportunity briefs; cash default; equity only when flagged | Build 5 (R7) |
| `discovery-research-assistant` | `.claude/agents/discovery-research-assistant.md` | Generative user-research logistics/production: discussion guides, screeners, test plans, transcript coding, candidate packs, report assembly; never synthesizes | Build 6 (R14) |
| `heuristic-evaluator` | `.claude/agents/heuristic-evaluator.md` | Systematic heuristic evaluation (Nielsen + WCAG-AA base; domain layers); candidate severities, not verdicts; reads layers from contracts/heuristics/ at runtime | Build 6 (R15) |
| `live-observer` | `.claude/agents/live-observer.md` | Phase 2 live-observation subagent — screenshots, a11y dumps, axe-core, console/network capture; runs fixture-first, then narrow production pass; no mutation tools | Build 6 (R15b) |

---

## Ground Rules (non-negotiable — enforce in every agent, every PR)

### 1. Contracts are the source of truth
`/contracts/register.yaml`, `/contracts/kickoff-record-template.yaml`, `/contracts/program-config-schema.yaml`, and `/contracts/qec-rubric.md` are the runtime contracts agents read. If an agent needs information that should live in a contract, extend the contract — never hardcode values in a prompt. Contract structure changes go through a proposed-edit PR; content edits by Partners only.

### 2. No individual names in any agent prompt, ever
Agents reference `partner.*` IDs, the **Lead Partner** / **Second Partner** seats, or a **Register lookup**. Names resolve only through `register.yaml` at runtime. The name-lint test (`tests/lint_names.py`) enforces this on every agent file in `.claude/agents/`.

### 3. Escalations resolve to exactly three addresses
- **Lead Partner** — engagement decisions: pricing, scope changes, anything client-visible
- **Second Partner** — independent gate on agent-produced client-facing/public output
- **Register lookup** — domain-sensitive judgment (e.g., A&D disclosure questions route to the Partner holding `cred.aerospace-defense`)

An agent prompt that escalates anywhere else is wrong. The no-send audit (`tests/audit_no_send.sh`) enforces the no-Bash/no-send rule.

### 4. QEC is structural
Every client-facing or public artifact an agent produces carries `qec: pending` in its frontmatter. The authoring agent never clears its own output. The QEC Reviewer clears Layer 2; Partners clear the rest per tier. See `/contracts/qec-rubric.md` §1 for the full tier map and clearance authority.

**Research artifacts and QEC:** Research outputs (coded transcripts, competitive matrices, pre-call briefs, gap lists) are pre-synthesis internal material. They carry `qec: pending` and `tier: 1` by default and do not go client-facing unmediated. If content from a research artifact is incorporated into a client readout, that readout carries its own tier and QEC cycle — the research artifact's tier does not transfer.

### 4a. Evidence-not-synthesis principle (research-analyst)
The research-analyst produces evidence and pattern CANDIDATES only. It never produces synthesis, strategy, or recommendations. This is enforced:
- **In the prompt:** explicit forbidden phrases ("the finding is", "we recommend", "the strategy is", "Interactivism should") and an absolute rule that all inference is labelled `[INFERENCE: <reason>]`
- **In the test:** `research_analyst_dry_run.py` scans all output for synthesis verbs and fails if any are found
- **In the output:** every research artifact carries `analyst_note` in its frontmatter stating "Synthesis, strategy, and recommendations belong to the Partner"

The line between evidence and synthesis is structural, not stylistic. The test enforces it mechanically.

### 4b. Engagement workspaces are under version control with a baseline commit
Every engagement workspace is initialised under version control **and given at least one baseline commit** before any artifact is written. An initialised repository with no commits provides no recovery point while appearing to. Captures and other bulk working material (screenshots, accessibility dumps, raw network logs) are gitignored. Without history: a hand-edit by a human and a rewrite by an agent are indistinguishable afterwards, neither can be dated, and a bad edit is unbounded.

Clearance records (QEC approvals, attestation ticks) should live outside the artifact they clear where possible — a record inside a file is destroyed by anyone editing that file, including the agent that authored it.

### 5. Draft, never execute — and read widely, mutate narrowly
Agents report or draft. Nothing leaves the repo or any external system autonomously. This invariant holds for all connectors:
- **Calendar:** read only. No event creation, editing, or response.
- **Drive:** read anywhere granted; write only inside the engagement's own `connectors.drive_folder_id`. Path guard enforced in agent logic and tested separately.
- **Gmail:** draft creation only. Drafts land in the Lead Partner's Gmail Drafts; the Partner reviews and sends manually. No send, reply, label, or archive.

The draft-only audit (`tests/audit_no_send.sh`) enforces this policy on every agent's tool declaration. It permits `create_draft`, `list_events`, `create_file`, and other safe operations, while failing on `create_event`, `update_event`, `delete_event`, `respond_to_event`, `label_message`, `label_thread`, and all send-capable tools.

---

## Model Map

| Work | Model | ID |
|------|-------|----|
| Default agent runtime | Sonnet 4.6 | `claude-sonnet-4-6` |
| Volume / hygiene passes (lead enrichment, CRM hygiene, formatting) | Haiku 4.5 | `claude-haiku-4-5-20251001` |
| Strategic synthesis, org design (Phase 1) | Fable 5 | `claude-fable-5` |
| API automation, top-tier reasoning | Opus 4.8 | `claude-opus-4-8` |

**Reviewer rule:** `quality-ethics-reviewer` always runs as a **fresh instance per artifact** — no shared context with the authoring agent. This structural independence is the entire value.

---

## Artifact Frontmatter Convention

Every agent-produced artifact (case studies, proposals, status updates, interview guides, approval email drafts) must include this frontmatter block:

```yaml
---
qec: pending              # pending | pass | pass-with-notes | blocking | halted-disclosure | approved
tier: <1|2|3>             # 1=internal, 2=client-visible, 3=public/credential-bearing
engagement: <eng.id>      # from kickoff.yaml, or "studio" for non-engagement artifacts
evidence_trail:
  - claim: "<verbatim claim>"
    source: <path to evidence file>
    type: <raw-capture|retro|metrics|partner-interview|client-doc>
  - claim: "[NEEDS EVIDENCE] — <claim text>"
    source: ~
    type: ~
---
```

Rules:
- `qec: pending` is the only valid initial state — authoring agents never set it to anything else.
- `evidence_trail` must have an entry for every factual claim. Unverifiable claims use `[NEEDS EVIDENCE]` — never write around them.
- `tier` must reflect the artifact's intended audience. QEC Reviewer may escalate; never downgrade.

---

## How to Add an Agent

1. Create `.claude/agents/<kebab-name>.md` with YAML frontmatter (`name`, `description`, `tools`, `model`) followed by the system prompt.
2. Tools list: Read, Grep, Glob, Write are baseline. No Bash, no WebFetch, no mail tools unless explicitly approved in a PR. Any send-capable tool requires Partner sign-off and a documented rationale.
3. System prompt must not contain any individual names. Use `partner.*` IDs or seat references only.
4. Escalation rules must resolve to Lead Partner, Second Partner, or Register lookup — nothing else.
5. Run all tests before merging: `make test` or see Test Commands below.
6. Update this CLAUDE.md if the agent introduces a new pattern, tool, or escalation path.

---

## Test Commands

```bash
# Run all tests
make test

# Individual tests
python3 tests/lint_names.py                  # Ground rule 2: no names in agent prompts
python3 tests/validate_contracts.py          # Ground rule 1: contract YAML validity
bash tests/audit_no_send.sh                  # Ground rule 5: no send-capable tools

# Agent dry runs (requires fixture files in tests/fixtures/)
python3 tests/reviewer_dry_run.py            # QEC Reviewer: three fixture artifacts
python3 tests/writer_dry_run.py              # Case Study Writer: fixture engagement → full ladder
python3 tests/producer_dry_run.py            # Engagement Producer: meeting notes → logs → status draft

# Build 2b connector tests
python3 tests/producer_calendar_test.py      # Stage 1: calendar read → enriched status draft
python3 tests/producer_drive_test.py         # Stage 2: Drive sync + path guard
python3 tests/producer_gmail_test.py         # Stage 3: Gmail draft prerequisites + blocking

# Build 4a research analyst test
python3 tests/research_analyst_dry_run.py    # Research Analyst: transcript coding, matrix sourcing, disclosure tripwire, synthesis verb scan

# Build 3 BD engine test
python3 tests/program_agnosticism_test.py    # THESIS TEST: BD agents run dummy program with zero prompt edits; no vertical residue

# Build 4b spec and agent tests
python3 tests/validate_spec_template.py      # Spec-template conformance: validates a component spec against /contracts/spec-template.md
python3 tests/r8_dry_run.py                  # R8: Figma export → spec; missing-state flag; raw-value flag; VH hooks
python3 tests/r10_dry_run.py                 # R10: spec → QA matrix; bug detection; go/no-go; COUPLING TEST (VH-IDs match)

# Build 5 proposal/terms tests
python3 tests/validate_terms_library.py      # Terms-library conformance: all template files exist + SOW structure + equity model integrity
python3 tests/r7_dry_run.py                  # R7: cash-default; SELECTIVITY TEST (zero equity for non-flagged); equity model; QEC pipe-through

# Build 6 user-research layer tests
python3 tests/validate_heuristics_contract.py  # Heuristics contract: layer definitions, severity matrix, AAA flag rule, Register diff
python3 tests/candidate_discipline_test.py     # SPINE TEST: candidate-language discipline across R6, R14, R15; synthesis refusal behavior
python3 tests/r14_dry_run.py                   # R14: discussion guide, screener, coded transcript, candidate pack, synthesis refusal, report assembly
python3 tests/r15_dry_run.py                   # R15: layer declaration; AAA FLAG TEST (AA only vs AAA-flagged); disclosure tripwire; no reserved-verdict language
python3 tests/live_observer_dry_run.py         # R15b: tool-list (no mutation tools); fixture-pass PII discipline; production-pass browser_evaluate exclusion
```

Tests are plain bash/python — no external test framework required.

---

## Directory Structure

```
interactivism-agents/
├── CLAUDE.md
├── contracts/
│   ├── register.yaml                  # Partner/credential/asset register (source of truth)
│   ├── kickoff-record-template.yaml   # Template for engagement kickoff records
│   ├── program-config-schema.yaml     # Schema for outbound program configs
│   ├── qec-rubric.md                  # QEC tier map, reviewer format, disclosure protocol
│   ├── reference-set/                 # Craft-bar benchmarks (seed before first reviewer run)
│   ├── disclosure/                    # Per-credential sensitive term lists
│   └── crm-conventions.md             # CRM field/stage conventions (stub — Build 2)
├── .claude/
│   └── agents/
│       ├── quality-ethics-reviewer.md
│       ├── case-study-writer.md
│       ├── engagement-producer.md
│       ├── research-analyst.md
│       ├── design-production-assistant.md   # R8 — Figma read → component spec
│       └── qa-runner.md                     # R10 — spec → QA matrix + coupling
├── engagements/
│   └── _template/                     # Copy and rename per engagement
│       ├── kickoff.yaml               # Includes cadence, stakeholders, milestones, qec, changelog
│       ├── artifacts/
│       ├── qec-reports/
│       ├── decision-log.md            # Maintained by engagement-producer
│       ├── action-tracker.md          # Maintained by engagement-producer; flags overdue items
│       ├── status-updates/            # Weekly status drafts (qec: pending, tier: 1)
│       ├── flags/                     # Producer/analyst escalation flags
│       └── research/                  # Phase 4 research artifacts (Build 4a)
│           ├── research-plan.md       # Research questions, topics, planned sources
│           ├── evidence/              # Raw evidence files
│           ├── transcripts/           # Raw interview transcripts (do not edit — analyst reads these)
│           └── briefs/                # Pre-call briefs
├── programs/
│   ├── aerospace-defense/
│   │   └── config.yaml
│   ├── adtech/
│   │   ├── config.yaml                # AdTech program — status: ready, operating_partner: TBD
│   │   └── voice/                     # EMPTY — must be assembled before activation (see README)
│   │       └── README.md
│   ├── aerospace-defense/
│   │   └── config.yaml                # status: blocked-on-anchor (Kratos pending)
│   └── _test/                         # Dummy program for agnosticism test (Build 3)
├── artifacts/
│   ├── case-studies/                  # Studio-level case study drafts
│   └── qec-reports/                   # QEC reports for studio-level artifacts
└── tests/
    ├── fixtures/                      # Synthetic artifacts for dry runs
    ├── lint_names.py
    ├── validate_contracts.py
    ├── audit_no_send.sh
    ├── reviewer_dry_run.py
    ├── writer_dry_run.py
    ├── producer_dry_run.py
    ├── producer_calendar_test.py
    ├── producer_drive_test.py
    ├── producer_gmail_test.py
    └── fixtures/
        ├── calendar-fixture.json      # Fixture calendar API response for Stage 1 test
        ├── engagement-fixture/        # Fixture engagement for producer dry run tests
        ├── research-fixture/          # Fixture engagement for research-analyst dry run
        │   ├── kickoff.yaml           # Includes aerospace-defense disclosure domain
        │   ├── research-plan.md       # Synthetic research plan with 4 RQs
        │   └── transcripts/
        │       └── interview-2026-06-01.md  # Synthetic transcript with seeded sensitive term
        ├── spec-fixture/              # Fixture for R8 and R10 dry runs (Build 4b)
        │   ├── figma-button-export.json     # Mock Figma MCP response (Button, 3 variants, missing disabled, raw value)
        │   ├── staging-button.html          # Synthetic staging page with 2 seeded bugs
        │   └── button-spec-v0.1.0.md        # Fixture spec (10 VH hooks); coupling test pivot
        └── qec-reports/               # QEC reports produced by reviewer and writer dry runs
```

## Connector Policy (Build 2b)

The `engagement-producer` agent has access to three external connectors. All follow the invariant: **read widely, mutate narrowly, draft never send.**

| Connector | Tools permitted | Tools forbidden |
|---|---|---|
| Google Calendar | `list_calendars`, `list_events`, `get_event` | `create_event`, `update_event`, `delete_event`, `respond_to_event` |
| Google Drive | `search_files`, `read_file_content`, `get_file_metadata`, `create_file` (engagement folder only) | Any write outside `connectors.drive_folder_id` |
| Gmail | `create_draft` | Everything else (send, reply, label, archive) |

**Canonical source:** Drive is canonical for the live engagement record when `connectors.drive_folder_id` is set. The repo holds templates and agent code.

**Path guard:** The producer verifies `parentId == connectors.drive_folder_id` before every Drive write. A blocked write produces a local flag file (`flags/drive-path-guard-<date>.md`) routed to the Lead Partner — it never executes.

**Gmail prerequisites:** The producer only creates a Gmail draft when (1) a QEC report exists for the status draft with verdict PASS or PASS-WITH-NOTES, and (2) all `stakeholders[].contact` fields are set. A missing prerequisite produces `flags/gmail-draft-blocked-<date>.md` instead.

To configure connectors for an engagement, set `connectors.calendar_id` and `connectors.drive_folder_id` in the engagement's `kickoff.yaml`.

---

## Spec-Template Contract (Build 4b)

`/contracts/spec-template.md` is the canonical component-spec format. It is a runtime contract peer to `kickoff-record-template.yaml` and `qec-rubric.md`.

**The coupling mechanism:** R8 writes `verification_hooks` in the spec frontmatter with stable VH-NN IDs. R10 reads those exact IDs to build its QA matrix. Every VH-ID in a spec must appear in R10's matrix row-for-row. The coupling test (`tests/r10_dry_run.py`) asserts this mechanically — it fails if any VH-ID is missing or if R10 invents a VH-ID not in the spec.

**Ten required sections** (per `contracts/spec-template.md §2`): Identity, Anatomy, Variants, States, Behavior, Responsive Rules, Tokens, Accessibility, Content Guidelines, Verification Hooks. Sections must not be omitted. If a section has no content, write "N/A — [reason]".

**Conformance test:** `tests/validate_spec_template.py <path-to-spec>` validates any spec file against the contract. Runs as part of `make test` against the fixture spec.

**DS conventions source:** R8 resolves the current DS conventions document via `contracts/register.yaml` → `asset.design-system-conventions` (maintained by the Partner listed there). Conventions conflicts → Register lookup, never improvised.

**Versioning:** Specs use semver. VH-IDs are stable within a major version. Retiring a VH-ID requires a spec changelog entry and a version bump — reusing a VH-ID with different semantics creates silent QA coverage gaps.

---

## R8 / R10 Agent Policy (Build 4b)

### R8 — design-production-assistant

| Category | Tools permitted | Tools forbidden |
|---|---|---|
| File I/O | Read, Grep, Glob, Write | Bash, Computer |
| Web | WebFetch (staging, for drift checks) | WebSearch |
| Figma | `get_design_context`, `get_metadata`, `get_variable_defs`, `get_screenshot`, `search_design_system`, `get_libraries` (READ ONLY) | `use_figma`, `generate_figma_design`, `create_new_file`, `upload_assets`, `add_code_connect_map`, `send_code_connect_mappings` |
| Drive | `search_files`, `read_file_content`, `get_file_metadata`, `create_file` (engagement folder only) | writes outside engagement folder |
| Gmail | none | all |

R8 never edits Figma. R8 never invents design decisions. Missing states → flag. Raw values → flag. Conventions conflicts → Register lookup.

### R10 — qa-runner

| Category | Tools permitted | Tools forbidden |
|---|---|---|
| File I/O | Read, Grep, Glob, Write | Bash, Computer |
| Web | WebFetch (staging URLs) | WebSearch |
| Figma | none | all |
| Drive | `search_files`, `read_file_content`, `get_file_metadata`, `create_file` (engagement folder only) | writes outside engagement folder |
| Gmail | none | all |

R10 reads specs and staging; it has no Figma tools. R10 never decides go/no-go — it produces evidence and routes the decision to the Lead Partner. R10 never tests around a wrong spec — it flags the spec and pauses that hook.

**Go/no-go rule:** The summary presents counts and failures. The Partner decides. Human UAT and the Partner "does it feel right" pass remain on top of R10's matrix.

---

## Research Analyst Policy (Build 4a)

The `research-analyst` is the evidence throughput layer for Phase 4 Research & Strategy. It reads widely and writes only to the engagement's `research/` folder and `flags/`.

### Tools

| Category | Tools permitted | Tools forbidden |
|---|---|---|
| File I/O | `Read`, `Grep`, `Glob`, `Write` | `Bash`, `Computer` |
| Desk research | `WebSearch`, `WebFetch` | — |
| Drive (read only) | `search_files`, `read_file_content`, `get_file_metadata` | `create_file` (analyst does not write to Drive) |
| Calendar (read only) | `list_calendars`, `list_events`, `get_event` | all mutation tools |
| Gmail | none | all |
| Figma | none | all |

### Evidence-vs-Synthesis Boundary

The analyst produces evidence, not conclusions. The enforcement is layered:

1. **Prompt-level:** Explicit forbidden phrases ("the finding is", "we recommend", "the strategy is", "Interactivism should"). Every inference carries `[INFERENCE: <reason>]`.
2. **Test-level:** `research_analyst_dry_run.py` scans all simulated outputs for synthesis verbs. Any hit is a test failure.
3. **Artifact-level:** Every research output frontmatter includes `analyst_note` stating "Synthesis, strategy, and recommendations belong to the Partner."

### Disclosure Tripwire

The analyst runs the disclosure tripwire before writing any output file. If a sensitive term from `contracts/disclosure/<domain>.md` appears in the planned output, the analyst writes `flags/disclosure-flag-<date>.md` (routed to the Register-resolved credential holder) and does NOT write the output. The same disclosure protocol as the QEC Reviewer applies — disclosure first, everything else waits.

### Research Outputs (all Tier 1, qec: pending)

| Output | File | When produced |
|---|---|---|
| Coded transcript | `research/coded-transcript-<date>.md` | After each interview transcript lands in `research/transcripts/` |
| Competitive matrix | `research/competitive-matrix-<date>.md` | On request or when a competitive question appears in the decision log |
| Pre-call brief | `research/brief-<topic>-<date>.md` | Before a discovery or sales call |
| Gap list | `research/gap-list-<date>.md` | As a standalone or appended to transcripts/matrices |
| Disclosure flag | `flags/disclosure-flag-<date>.md` | When disclosure tripwire trips; suppresses all other output |

---

## BD Engine Policy (Build 3)

The three BD agents are parameterized per program. Vertical, ICP, credential anchors, and voice corpus are runtime inputs read from `programs/<slug>/config.yaml` — never baked into agent prompts. A prompt containing any AdTech- or A&D-specific value is a build failure.

**The program-agnosticism test** (`tests/program_agnosticism_test.py`) proves this: both R2 and R3 run against a synthetic dummy program (`programs/_test/`) with zero prompt edits, and produce output with zero residue from any real program.

### Program status lifecycle

| Status | Meaning |
|---|---|
| `draft` | Config incomplete |
| `blocked-on-anchor` | Config complete but no published credential anchor |
| `ready` | Config complete + anchor published; dormant, not live |
| `active` | Sequences running; Partner has activated |
| `paused` | Temporarily stopped |
| `retired` | Permanently stopped |

**No program is set to `active` in this repo today.** Activation is a human step requiring: (1) assign operating_partner, (2) assemble voice corpus ≥3 samples, (3) Tier-2 QEC consult on templates, (4) set status: active.

### Agent tool policy

| Agent | Model | Gmail | Calendar | Drive | Figma | Bash |
|---|---|---|---|---|---|---|
| R2 `bd-prospect-researcher` | Haiku 4.5 | none | none | read/write (program folder) | none | Apollo REST API only (curl to api.apollo.io; no other shell commands) |
| R3 `outbound-sequence-operator` | Sonnet 4.6 | `create_draft`, `get_thread`, `list_drafts`, `search_threads` | read only | read/write (program folder) | none | none |
| R4 `pipeline-ops-clerk` | Haiku 4.5 | none | read only | read/write (pipeline + reports) | none | none |

R3's only Gmail capability is `create_draft`. It never sends. Every draft is `qec: pending, tier: 1`; the operating Partner approves and sends manually.

### Guardrails (structural, not advisory)

**Anchor guardrail (R2 + R3):** Both agents check that the config has at least one `credential_anchor` with `anchor_status: published` before doing any work. No published anchor → stop + flag. The sequence cannot personalize around a credential that has no live URL.

**Voice corpus guardrail (R3):** R3 checks that `programs/<slug>/voice/` contains at least one resolvable `email-sample` or `proposal-excerpt` file before drafting. Empty corpus → stop + request. There is no default voice. Fabricating a voice is a breach of the operating Partner's professional identity.

### CRM conventions

`contracts/crm-conventions.md` is the canonical source for: field schema, stage definitions (10 canonical stages), required fields per stage, dedup policy, fill report format, daily digest format, and inbound intake protocol. BD agents read it at runtime. Structure changes require outbound-system maintainer sign-off (Register lookup).

### Proposed Register diff

`contracts/proposed-diffs/register-adtech-anchor-2026-06-22.md` contains the proposed addition of `cred.adtech` with the tvScientific anchor (verified live 2026-06-22 at `interactivism.com/work/tvscientific-*`). **AWAITING PARTNER CONFIRMATION** — not yet applied to `contracts/register.yaml`.

---

## Terms-Library Contract (Build 5)

`/contracts/terms-library/` is the canonical proposal and SOW template library. It is the proposal/SOW equivalent of `/contracts/spec-template.md`. R7 reads it at runtime; Partners maintain it.

**Files:**

| File | Purpose |
|---|---|
| `sow-template.md` | Canonical SOW scaffold (7 required sections; all phases need deliverables + acceptance criteria + exit gate) |
| `proposal-template.md` | Narrative wrapper around the SOW |
| `assumptions-register-template.md` | What Interactivism believes true; what changes price if false |
| `rate-card.md` | Day/role rates and revision-round pricing — all `[PARTNER: confirm]` |
| `pricing-options-format.md` | How scope-down / target / scope-up are structured |
| `equity-addendum-template.md` | Hybrid cash/equity addendum — ONLY used when `equity_eligible: true` |
| `equity-model.xlsx` | Live financial model for hybrid deals (4 sheets, all inputs `[PARTNER: confirm]`) |

**Maintainer:** `asset.terms-templates` in `contracts/register.yaml`.

**Conformance test:** `tests/validate_terms_library.py` validates a sample SOW against `sow-template.md` structure (61 checks).

---

## R7 — proposal-terms-drafter Policy (Build 5)

### Cash default — structural rule

R7's output is always cash-only unless `equity_eligible: true` is explicitly set in the opportunity brief by a Partner. Absent that flag:
- R7 produces three cash pricing options (scope-down / target / scope-up) and nothing else
- Equity, SAFE, and hybrid terms do not appear — not as an option, not as a footnote, not as a suggestion
- The `tests/r7_dry_run.py` SELECTIVITY TEST asserts this mechanically: equity content must appear if and only if a human set the flag

### When equity IS flagged

R7 reads `equity-addendum-template.md` and `equity-model.xlsx`, runs the model, and presents cash-equivalent comparisons across conservative/base/upside scenarios. Equity is framed as options with rationale — never as a recommendation. Lead Partner decides; Second Partner is Consulted (per QEC §1 — Second Partner gates all equity structures).

### QEC and tools

| Category | Tools permitted | Tools forbidden |
|---|---|---|
| File I/O | Read, Grep, Glob, Write | Bash |
| Drive | `search_files`, `read_file_content`, `get_file_metadata`, `create_file` | writes outside engagement folder |
| Gmail | none | all |
| Calendar | none | all |
| Figma | none | all |

Every R7 output is `qec: pending, tier: 2`. R7 has no pricing authority, no send capability, and no ability to accept client redlines — all deviations are flagged to the Lead Partner.

### Escalation rules

- **Brief lacks budget band or decision-maker map:** Stop; flag to Lead Partner before drafting
- **A&D contracting nuance:** Register lookup → `cred.aerospace-defense` holder
- **Client redline on equity terms:** Flag to Lead Partner + `asset.terms-templates` maintainer (Register lookup); no revised draft until approved

---

## Heuristics Contract (Build 6)

`/contracts/heuristics/` is the runtime heuristic evaluation standard R15 reads at evaluation time. R15 never hardcodes layer definitions — adding a domain layer is a contract edit, not an agent rebuild.

**Files:**

| File | Purpose |
|---|---|
| `heuristic-layers.md` | Base (Nielsen-10 + WCAG-2.2-AA always) + domain layers (LAYER-AI/MS18/PAIR, LAYER-MOBILE/SMASH, LAYER-WEBAPP/Tognazzini) + AAA escalation rule |
| `severity-effort-matrix.md` | S0–S4 severity × E1–E4 effort + advisory priority readout (DO FIRST / PLAN IN / QUICK WIN / BACKLOG) |
| `layer-selection-guardrails.md` | How R15 declares layers with trigger evidence before evaluating |

**Maintainer:** `asset.heuristics-standards` in `contracts/register.yaml` — either Partner may maintain; heuristic-set / layer ambiguity routes to the Lead Partner seat. Distinct from `asset.qec-standards` (QEC rubric). Both route via Register lookup.

**Conformance test:** `tests/validate_heuristics_contract.py` validates all heuristic contract files and the Register diff.

---

## Candidate-Language Discipline (Build 6)

The spine that governs R6, R14, and R15: **agents produce candidates bound to evidence; Partners own synthesis and final judgment.**

| Language | Who uses it | Who does NOT use it |
|---|---|---|
| "candidate," "signal," "participants reported," "recommend (advisory)" | R6, R14, R15 | — |
| "finding," "the finding is," "insight," "users want," "the research shows" | Partner only | R6, R14, R15 |
| "must fix," "critical" (verdict), final go/no-go | Partner only | R6, R14, R15 |
| "candidate severity," "advisory priority," "Partner confirms" | R15 | — |

**Structural enforcement:**
- Every candidate (pattern, severity, issue) MUST cite specific evidence. A candidate with no evidence rows is blocked output, not a weak finding.
- Confidence is always stated (session count, mention count, single source vs pattern).
- Inference is always labelled: `[INFERENCE: <reason>]` — never blurred with direct observation.
- Synthesis refusal is structural: when asked to synthesize, R14 and R6 return candidates-with-evidence and state that synthesis is Partner work.

**Test:** `tests/candidate_discipline_test.py` — SPINE TEST across all three agents.

---

## R14 — discovery-research-assistant Policy (Build 6)

R14 owns the production and logistics of generative user research and user testing. It surfaces pattern candidates; it never authors findings, synthesis, or the insight section of any report.

### Tools

| Category | Tools permitted | Tools forbidden |
|---|---|---|
| File I/O | Read, Grep, Glob, Write | Bash |
| Web | WebSearch, WebFetch | — |
| Gmail | `create_draft`, `list_drafts` (recruiting/scheduling drafts only) | all send tools (`label_message`, etc.) |
| Calendar | `list_calendars`, `list_events`, `get_event` (read only) | `create_event`, `update_event`, `delete_event` |
| Drive | `search_files`, `read_file_content`, `get_file_metadata`, `create_file` (engagement folder) | writes outside engagement folder |

### Respondent.io seam

R14 is built to call a recruiting interface abstraction, not respondent.io directly. The respondent.io REST API wrapper is a **deferred seam** — preferred over a third-party tool-router given participant PII and consent data. Until the wrapper is built: **file-only posture** — R14 produces screeners and criteria as files the Partner acts on manually.

### Synthesis boundary

R14 refuses to author synthesis, conclusions, or the insight section even when asked. On a "just synthesize this" request: returns candidates-with-evidence + states "Synthesis belongs to the Partner." The report assembly produces the structure around a Partner-authored insight section — the section itself is a Partner input.

### QEC tiers

| Output | Tier |
|---|---|
| Internal candidate packs, coded transcripts | Untiered (pre-synthesis) — Partner reviews informally |
| Discussion guides, test plans (internal) | Tier 1 |
| Discussion guides, test plans (client-facing) | Tier 2 |
| Research reports (internal) | Tier 2 |
| Research reports (published) | Tier 3 |

---

## R15 — heuristic-evaluator Policy (Build 6)

R15 conducts heuristic evaluations, reading layer definitions from `contracts/heuristics/` at runtime. Severities are candidate ratings the Partner confirms — R15 never issues final verdicts or go/no-go calls.

### Tools

| Category | Tools permitted | Tools forbidden |
|---|---|---|
| File I/O | Read, Grep, Glob, Write | Bash |
| Web | WebFetch, WebSearch | — |
| Figma | `get_design_context`, `get_screenshot`, `get_metadata`, `get_variable_defs`, `get_libraries`, `search_design_system` (READ ONLY) | `use_figma`, `generate_figma_design`, `create_new_file`, `upload_assets` |
| Drive | `search_files`, `read_file_content`, `get_file_metadata`, `create_file` (engagement folder) | writes outside engagement folder |
| Gmail | none | all |
| Calendar | none | all |

### WCAG AAA rule

**WCAG 2.2 AAA applies only when `accessibility_target: AAA` is set in the kickoff record, OR when `federal: true` is set.** Absent the flag: AA is the bar. R15 may note AAA gaps as optional candidates labelled "AAA — not required absent the flag" — it does NOT hold the product to AAA or rate AAA gaps as failures. **Inferring AAA without the flag is a behavioral error.** The AAA-flag test in `tests/r15_dry_run.py` enforces this.

### Layer declaration rule

R15 MUST produce a "Layers Applied" section — naming each layer, its trigger evidence, and excluded layers — BEFORE any findings. Evaluating without layer declaration is a behavioral error.

### Three output modes

| Mode | Format |
|---|---|
| `scored` (default) | Findings table + severity×effort matrix + theme summary |
| `narrative` | Report: context, layers, findings as prose, recommendations |
| `structured` | Machine-readable YAML for QEC/tooling intake |

---

## R15b — live-observer Policy (Build 6)

`live-observer` is a dedicated Phase 2 subagent split from R15. It holds browser observation tools; R15 holds the static-pass tools. The coupling seam between them is `eval-v2/findings/pii-selector-map.md` (Phase 1 deliverable) — exactly analogous to the VH-ID coupling between R8 and R10.

### Split rationale

R15's tool list is structurally read-only (no browser tools). Phase 2 requires `browser_evaluate` for PII substitution injection. `browser_evaluate` is also mutation-capable; there is no tool-level boundary between "rewrite text nodes" and "click buttons." The split isolates mutation-capable tools in a subagent whose system prompt enforces the fixture-first constraint — where mutation-tool blast radius is near-zero — and excludes those tools entirely from the production pass.

### Dual-config pattern

Two Playwright config files exist in `eval-v2/`:

| Config | Origin | Auth | `browser_evaluate` |
|--------|--------|------|--------------------|
| `playwright.config.fixture.ts` | `http://localhost:5173` | None | Permitted (fixture data, no real customers) |
| `playwright.config.ts` | `https://app.cartconvert.ai` | `auth.json` | **Not used** |

`live-observer` always uses the fixture config first. Production is only reached for the four things fixtures cannot show: real queue density, real latency, induced error/rate-limit states, rendered contrast.

### Tools

| Category | Tools permitted | Tools forbidden |
|---|---|---|
| File I/O | Read, Grep, Glob, Write | Bash |
| Browser (observation) | `browser_navigate`, `browser_snapshot`, `browser_take_screenshot`, `browser_console_messages`, `browser_network_requests`, `browser_wait_for`, `browser_find`, `browser_evaluate` (fixture pass only), `browser_resize`, `browser_hover` | `browser_click`, `browser_type`, `browser_fill_form`, `browser_press_key`, `browser_select_option`, `browser_drag`, `browser_handle_dialog`, `browser_file_upload`, `browser_run_code_unsafe` |
| Drive | `search_files`, `read_file_content`, `get_file_metadata`, `create_file` (engagement folder) | writes outside engagement folder |
| Gmail | none | all |
| Calendar | none | all |
| Figma | none | all |

### Audit coverage

`tests/audit_no_send.sh` is extended in Build 6 to include all Playwright mutation tools in the globally-forbidden list. Any agent file that declares `browser_click`, `browser_type`, `browser_fill_form`, `browser_press_key`, `browser_select_option`, `browser_drag`, `browser_handle_dialog`, `browser_file_upload`, or `browser_run_code_unsafe` will fail the audit.

`tests/live_observer_dry_run.py` asserts:
- Tool-list scenario: mutation tools absent; required observation tools present
- Fixture-pass scenario: PII substitution discipline (querySelectorAll, document.body scope, liveness flag, persona keying, no event dispatch, watermarking, D1/D2 handling)
- Production-pass scenario: browser_evaluate excluded; scope limited; borrowed-account rule stated

---

## Reference documents

The strategic blueprint — design rationale, full role specs, RACI, QEC design notes, rollout logic, and the Cowork migration appendix — lives at docs/interactivism-agent-org-blueprint.md. Read it when a task needs design context beyond the contracts (e.g. why a control exists, or the full spec behind an agent). It is rationale, not law: the runtime contracts in /contracts/ are the operational source of truth and win on any conflict. If the blueprint and a contract disagree, follow the contract and flag the discrepancy — do not reconcile them silently. Do not auto-load the blueprint into every session; reach for it only when design context is needed.
