---
artifact: programs/adtech/sequences/tim-farrer-brightline/touch-2.md
artifact_qec_state: pending
reviewed_at: 2026-08-28
verdict: PASS-WITH-NOTES
disclosure: OK
tier_check: 1
---

## Check 1 — Claim / Evidence Trace

**Result:** PASS

Two factual claims appear in the artifact body. Both trace to evidence_trail entries.

1. **"six years with tvScientific"**
   — maps to evidence_trail entry: source `https://interactivism.com/work/tvscientific-bringing-performance-to-ctv-advertising/`, type `client-doc`.
   Register confirms: `cred.adtech` notes "tvScientific engagement began at inception (2020)." Anchor URL is published. 2020 to 2026 is six years. PASS.

2. **"working with teams across AdTech, SaaS, and Aerospace"**
   — maps to evidence_trail entry: source `contracts/register.yaml`, type `raw-capture`.
   Register confirms: `cred.adtech` (AdTech/CTV), `cred.saas` (SaaS/AdTech/FinTech), and `cred.aerospace-defense` (Aerospace & Defense) are all live credentials with anchor clients. All three verticals are register-confirmed. PASS.

No untraced claims. No `[NEEDS EVIDENCE]` markers required.

## Check 2 — Craft Bar

**Result:** PASS-WITH-NOTES

`contracts/reference-set/outbound/` contains four files: `aerospace-defense-sample-1.md`, `aerospace-defense-sample-2.md`, `aerospace-defense-sample-3.md`, `aerospace-defense-sample-4.md`. All four are aerospace-defense samples. No AdTech outbound samples are present in the reference set.

Comparison against available samples: the artifact matches the structural pattern of the aerospace-defense outbound samples — short (under 150 words), one-problem frame, single soft CTA, no attachments, no product pitching. Voice is consistent: understated, first-person, practitioner-to-practitioner register.

PASS-WITH-NOTES — craft bar partially verified against available samples. No AdTech outbound reference exists; the comparison is cross-vertical. Lead Partner should note this gap and seed an AdTech outbound sample after this sequence is approved.

## Check 3 — Commitment Scan

**Result:** PASS

The artifact contains no pricing, timeline, or scope commitments. The calendar link (`https://calendar.app.google/h6nJW6RQZEmXwRSq8`) is an invitation to a discovery call, not a commitment. No deliverables, rates, or project scope are named.

## Check 4 — Disclosure Tripwire

**Result:** OK

Disclosure domain for the AdTech program: `~` (none). Per `programs/adtech/config.yaml`: `disclosure_domain: ~`. No disclosure term list exists or applies.

No disclosure domain for this program — check skipped.

## Check 5 — Hygiene & Tier Verification

**Result:** PASS

- **Frontmatter complete:** `qec`, `tier`, `engagement`, `evidence_trail` all present. Additional fields (`touch`, `day`, `channel`, `prospect`, `program`, `signal_source`, `anchor_url`, `drafted`, `drafted_by`) are supplementary and do not create hygiene failures. PASS.
- **Individual names in body text:** The artifact body contains "Erik Wingren" in the email signature. A `partner_ruling` block in the frontmatter (dated 2026-08-25, actor: partner.erik) explicitly scopes the name rule: "Name rule is scoped to agent prompts and internal artifacts. Outbound email salutations and signatures are exempt." This ruling is on-record in the artifact. PASS — Partner ruling on file.
- **Tier appropriateness:** Touch 2 is an outbound email sequence draft produced by an agent, `qec: pending`, never sent. It is internal operational output — no client has received it; it is not client-visible until the operating Partner approves and sends manually. Tier 1 is appropriate. No escalation warranted.
- **Attestation blocks:** No checklist or attestation block present. N/A.
- **Internal references:** `anchor_url` references `https://interactivism.com/work/tvscientific-bringing-performance-to-ctv-advertising/` — this is the published case study anchor confirmed in `contracts/register.yaml` under `cred.adtech`. `signal_source` references `https://www.linkedin.com/company/brightline` — an external URL, not an internal reference. No broken internal references. PASS.

## Verdict

**PASS-WITH-NOTES** — No FAIL items. One craft-bar note: no AdTech outbound reference exists in the reference set; comparison was cross-vertical against aerospace-defense samples. Artifact may advance to Layer 3 human review per §1.

## Disposition

One item for Lead Partner acknowledgment before advancement:

- **Craft bar gap (Check 2):** The outbound reference set contains only aerospace-defense samples. The cross-vertical comparison is favorable, but an AdTech-specific outbound sample should be seeded after this sequence is approved. No blocking action required for this artifact.
