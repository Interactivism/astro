# CRM Conventions
# Source of truth for all BD agent CRM operations.
# Program-agnostic — vertical-specific data lives in program config tags, not schema changes.
# Agents read this document at runtime. Structure changes require operating-Partner sign-off.
# Content edits (stage thresholds, field names) by outbound-system maintainer per Register.

---

## 1. CRM Tool & Storage

**Current tool:** Apollo.io (primary) with Drive-backed file representation.

- Apollo holds the live contact database. Drive holds pipeline records in `programs/<slug>/pipeline/` for agent reads/writes until Apollo MCP is connected.
- When Apollo MCP is configured, agents read/write Apollo directly; Drive files are the offline/test fallback.
- Program-specific tagging in Apollo uses the `program` field (see §5).

---

## 2. Stage Definitions

These stages are canonical. Agents maintain them exactly as written. No agent invents a stage or renames one. Stage ambiguity → Register lookup (outbound-system maintainer).

| Stage | Meaning | Entry condition | Exit condition |
|---|---|---|---|
| `prospect-new` | Record created; not yet enriched | Record written from any source | Enrichment complete |
| `prospect-enriched` | Verified email + signal + fit score | All required enrichment fields present | Sequence started or disqualified |
| `sequence-active` | Inside an active touch sequence | First touch drafted | Reply received or sequence exhausted |
| `replied` | Any reply received; not yet triaged | Inbound reply logged | Triage classification set |
| `interested` | Triaged as interested | Operator triages reply as interested | Partner approves reply + books call, or closes |
| `objection` | Triaged as objection | Operator triages reply as objection | Objection addressed or closed |
| `not-now` | Re-engage date set | Operator triages as not-now | Re-engage date reached |
| `booked` | Discovery call confirmed | Calendar invite accepted | Call held (move to `qualified` or `closed-lost`) |
| `qualified` | Call held; fit confirmed | Lead Partner logs qualification decision | Proposal stage or closed |
| `disqualified` | Doesn't meet ICP or won't engage | Operator or Partner judgment | Terminal — no re-engage |
| `suppressed` | Unsubscribe / never contact | Unsubscribe received or NEVER triage | Terminal — permanent |

**Terminal stages** (`disqualified`, `suppressed`): no automation touches these records. The pipeline-ops-clerk flags them in the digest only if they were moved without a log entry.

---

## 3. Contact Record Schema

Every prospect record is a YAML file at `programs/<slug>/pipeline/<email-slug>.yaml`.

```yaml
# programs/<slug>/pipeline/<email-slug>.yaml

contact:
  email: ~              # verified; primary unique key — dedup on this field
  first_name: ~
  last_name: ~
  title: ~
  linkedin_url: ~       # optional but strongly preferred
  prospect_location: ~  # city, state from LinkedIn profile — used for send-time scheduling; NOT the company HQ

company:
  name: ~
  domain: ~
  size_band: ~          # e.g. "500-2000" or "Series B, ~80 employees"
  hq_location: ~

program: ~              # program slug — e.g. aerospace-defense, adtech, _test
stage: ~                # one of the canonical stages in §2
fit_score: ~            # 1 (weak) to 5 (strong); set by R2 at enrichment
fit_rationale: ~        # one sentence; required when fit_score is set

signal:
  description: ~        # one sentence; what happened and why it's relevant
  date: ~               # ISO date of the signal event (not the research date)
  source_url: ~         # direct URL to source; required
  staleness_flag: ~     # true if signal date > 6 months before today

enrichment:
  verified_email: ~     # true | false | unknown
  enriched_date: ~      # ISO date when R2 last updated this record
  enriched_by: agent    # always "agent" for R2 output; "partner" for manual entries

sequence:
  touch_count: 0
  last_touch_date: ~
  sequence_start_date: ~
  thread_id: ~          # Gmail thread ID once a sequence is live

flags: []               # list of flag strings; e.g. ["missing-email", "stale-signal", "icp-edge-case"]

log:                    # append-only; newest entry last
  - date: ~
    actor: ~            # agent id or "partner"
    event: ~            # what happened
```

---

## 4. Deduplication Policy

**Primary key:** `contact.email` (lowercase, normalized). No two records in the same program may share an email.

**Dedup procedure for R2:** Before writing any new record, search existing pipeline files for a matching email. If found:
- Update the existing record (preserving log); do not create a duplicate.
- If the existing record is in `suppressed` or `disqualified`, write a flag file and stop — do not re-engage. Route to operating Partner.

**Cross-program dedup:** The same contact may appear across programs (different tags). R2 checks within its program only. The pipeline-ops-clerk checks cross-program weekly and flags duplicates for Partner review — the Partner decides which program owns the contact.

**Dedup on company domain:** If a company already has a `booked` or `qualified` record from any contact, R2 flags new same-company records rather than initiating a parallel sequence. One active conversation per company at a time.

---

## 5. Required Fields by Stage

Agents may not advance a record past a stage without these fields present. Missing fields → flag the record, do not advance.

| Stage | Required fields |
|---|---|
| `prospect-new` | contact.email, contact.title, company.name, program, stage |
| `prospect-enriched` | + enrichment.verified_email=true, signal.description, signal.date, signal.source_url, fit_score, fit_rationale |
| `sequence-active` | + sequence.sequence_start_date, sequence.touch_count ≥ 1 |
| `replied` | + sequence.thread_id, log entry for reply |
| `interested` / `objection` / `not-now` | + log entry with triage classification |
| `booked` | + sequence.thread_id, log entry with meeting date/time |

---

## 6. Program Tagging

Every record carries `program: <slug>`. When generating CRM-ready rows or reports:
- Filter by program slug to scope queries to a single program.
- Cross-program reporting (pipeline-ops-clerk) groups by program, never merges stages across programs.
- Apollo list IDs (when configured) map 1:1 to program slugs via `programs/<slug>/config.yaml → crm.list_id`.

---

## 7. Weekly Fill Report Format

R2 writes `programs/<slug>/reports/fill-report-<ISO-date>.md` after each weekly pass.

```markdown
# Pipeline Fill Report — <program label> — <ISO date>

## Counts by Stage
| Stage | Count | Delta (7d) |
|---|---|---|
| prospect-new | N | +N |
| prospect-enriched | N | +N |
| sequence-active | N | +N |
| ... | | |

## List Health
- Records with verified email: N / total
- Records with stale signal (>6mo): N
- Records with missing required fields: N (list slugs)
- Duplicate flags: N

## Added This Week
- N new records researched
- N records enriched from existing
- N records flagged (reason summary)

## Notes
<any anomalies or ICP questions for the operating Partner>
```

---

## 8. Daily Digest Format (Pipeline-Ops-Clerk)

R4 writes `programs/<slug>/reports/digest-<ISO-date>.md` each morning.

```markdown
# Pipeline Digest — <program label> — <ISO date>

## Flags Requiring Partner Action
- <record> — <reason> (e.g., "replied 26h ago, unanswered")
- <record> — stage: booked, no activity in 48h post-meeting

## Hygiene Issues
- Missing required fields: <list>
- Stale stages: <list>
- Duplicates detected: <list>

## No action needed: pipeline clean
```

If no flags, the digest states "No action needed: pipeline clean." It is never omitted.

---

## 9. Inbound Intake Protocol

When R4 detects an inbound inquiry (via Drive, CRM, or calendar signal):
1. Log the inquiry in `programs/inbound/intake-<ISO-date>-<slug>.yaml` with source, contact, credential-fit notes.
2. Do NOT assign a Lead Partner.
3. Write a routing note: "Queued for Lead-Partner assignment per Register capacity/fit rule."
4. Notify via a flag file; the Partner reads the digest and assigns.

---

## 10. Convention Ambiguity Protocol

If any agent encounters a situation not covered by this document:
1. Do not invent a convention.
2. Flag the gap in the relevant record's `flags[]` list.
3. Escalate to Register lookup (outbound-system maintainer) for resolution.
4. Document the resolution here on the next conventions update.
