---
artifact: programs/adtech/sequences/tim-farrer-brightline/touch-1.md
artifact_qec_state: pending
reviewed_at: 2026-08-28
verdict: PASS-WITH-NOTES
disclosure: OK
tier_check: 1
---

## Check 1 — Claim / Evidence Trace
**Result:** PASS

Two factual claims are present in the artifact body. Both are traced.

1. **Claim:** "starting at inception in 2020, designing the full campaign creation platform through five funding rounds and 120+ employees, and the Pinterest acquisition in February"
   - **Evidence trail entry:** source = https://interactivism.com/work/tvscientific-bringing-performance-to-ctv-advertising/, type = client-doc
   - **Verification:** Anchor URL confirmed live. Case study states engagement began at inception in 2020, five funding rounds, 120+ team members by mid-2024, Pinterest acquisition on February 17, 2026. All details match. **PASS**

2. **Claim:** "BrightLine add headcount steadily over the past year while holding your position as the leading interactive ad creative platform in CTV"
   - **Evidence trail entry:** source = https://www.linkedin.com/company/brightline, type = raw-capture
   - **Verification:** Source is a live LinkedIn signal; cannot be independently verified from repo files. Trail entry is present and claim is explicitly mapped. No [NEEDS EVIDENCE] marker is required since the source is cited. **PASS** (LinkedIn signal; reviewer notes the source is ephemeral and not a pinned repo file — Partner should confirm signal accuracy before send.)


## Check 2 — Craft Bar
**Result:** PASS-WITH-NOTES

Directory listing of `/contracts/reference-set/`: README.md, case-study/, outbound/, proposal/, site-copy/, status-update/

The `outbound/` category exists and matches this artifact type. Contents: aerospace-defense-sample-1.md, aerospace-defense-sample-2.md, aerospace-defense-sample-3.md, aerospace-defense-sample-4.md.

All four reference samples are aerospace-defense domain; no AdTech outbound benchmark exists in the reference set. Craft comparison against the A&D samples:

- **Structure:** Touch 1 matches the cold-open pattern in the reference samples — context hook, credential signal, curiosity question, soft CTA. PASS.
- **Specificity:** The credential anchor claim (inception 2020, five funding rounds, 120+ employees, Pinterest acquisition) is more specific than generic A&D samples. PASS.
- **Voice:** Conversational and first-person. Consistent with reference samples. PASS.
- **Framing:** Prospect-centric ("your position," "whether that kind of problem is something BrightLine is wrestling with"). PASS.

PASS-WITH-NOTES: No AdTech-specific outbound sample exists in the reference set. Once an AdTech sequence is approved and sent, a sample should be added to `/contracts/reference-set/outbound/` to establish an AdTech craft baseline.


## Check 3 — Commitment Scan
**Result:** PASS

No pricing, timeline, or scope commitments in this touch. The artifact invites a conversation; it does not commit to deliverables, rates, or timelines.


## Check 4 — Disclosure Tripwire
**Result:** OK

Disclosure domain for program adtech is `null` per `programs/adtech/config.yaml` (`disclosure_domain: ~`). Check skipped — no disclosure domain for this program.


## Check 5 — Hygiene & Tier Verification
**Result:** PASS-WITH-NOTES

- **Frontmatter completeness:** `qec`, `tier`, `engagement`, `evidence_trail` all present. Additional fields (`touch`, `day`, `channel`, `prospect`, `program`, `signal_source`, `anchor_url`, `drafted`, `drafted_by`, `partner_ruling`) are supplementary; their presence is not a hygiene issue. PASS.
- **Names in artifact body:** Individual names are present — salutation "Hi Tim," and signature block "Erik Wingren / Partner & Co-Founder / erik@interactivism.com / 323-528-0058." Per rubric §2 Check 5, names belong only in evidence_trail references or pull_quote attribution.
  - **partner_ruling:** Frontmatter contains a `partner_ruling` field dated 2026-08-25, from `partner.erik`, ruling that "Name rule is scoped to agent prompts and internal artifacts. Outbound email salutations and signatures are exempt." The QEC rubric (§1, §2) does not define `partner_ruling` as a formal clearing mechanism. However, the Lead Partner holds clearance authority per rubric §1. The ruling is documented; the Lead Partner has explicitly adjudicated this class of names. Reviewer notes the limitation but does not block on the basis of a documented Lead Partner ruling. PASS-WITH-NOTES.
- **Tier appropriateness:** Tier 1 (internal/operational) is correct for an unsent draft. CLAUDE.md BD Engine policy explicitly states "Every draft is `qec: pending, tier: 1`." No escalation warranted.
- **Internal references:** anchor_url (`https://interactivism.com/work/tvscientific-bringing-performance-to-ctv-advertising/`) verified live. No broken internal references.


## Verdict
**PASS-WITH-NOTES** — No FAIL results. Two notes:
1. Check 2: No AdTech outbound craft benchmark in reference set. Add one after first approved send.
2. Check 5: Names in body covered by documented partner_ruling (not a rubric-defined mechanism; Lead Partner has explicitly ruled).

## Disposition
No blockers. Artifact may advance to Layer 3 human review with Lead Partner acknowledgment of the two notes above. Before sending, Partner should confirm the BrightLine LinkedIn signal (headcount growth + "leading interactive ad creative platform in CTV" characterization) is still current.
