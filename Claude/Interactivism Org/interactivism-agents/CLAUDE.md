# Interactivism Agent Infrastructure — Repo Conventions

This repo contains the runtime contracts, agent definitions, and acceptance tests for Interactivism's agent-augmented operating model.

---

## Agent Roster

| Agent | File | Purpose | Build |
|---|---|---|---|
| `quality-ethics-reviewer` | `.claude/agents/quality-ethics-reviewer.md` | Structural QEC gate on all artifacts | Build 1 |
| `case-study-writer` | `.claude/agents/case-study-writer.md` | Converts engagements into case study drafts | Build 1 |
| `engagement-producer` | `.claude/agents/engagement-producer.md` | Maintains per-engagement coordination artifacts | Build 2a |
| `research-analyst` | `.claude/agents/research-analyst.md` | Evidence and pattern-extraction for Phase 4 Research & Strategy | Build 4a |
| `design-production-assistant` | `.claude/agents/design-production-assistant.md` | Turns accepted Figma work into build-ready component specs; runs drift checks | Build 4b (R8) |
| `qa-runner` | `.claude/agents/qa-runner.md` | Generates QA matrices from specs; executes against staging; produces evidence summaries | Build 4b (R10) |

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

# Build 4b spec and agent tests
python3 tests/validate_spec_template.py      # Spec-template conformance: validates a component spec against /contracts/spec-template.md
python3 tests/r8_dry_run.py                  # R8: Figma export → spec; missing-state flag; raw-value flag; VH hooks
python3 tests/r10_dry_run.py                 # R10: spec → QA matrix; bug detection; go/no-go; COUPLING TEST (VH-IDs match)
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
│   └── _test/                         # Stub — Build 3 agnosticism test
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

## Reference documents

The strategic blueprint — design rationale, full role specs, RACI, QEC design notes, rollout logic, and the Cowork migration appendix — lives at docs/interactivism-agent-org-blueprint.md. Read it when a task needs design context beyond the contracts (e.g. why a control exists, or the full spec behind an agent). It is rationale, not law: the runtime contracts in /contracts/ are the operational source of truth and win on any conflict. If the blueprint and a contract disagree, follow the contract and flag the discrepancy — do not reconcile them silently. Do not auto-load the blueprint into every session; reach for it only when design context is needed.
