---
artifact: programs/adtech/sequences/tim-farrer-brightline/touch-3.md
artifact_qec_state: pending
reviewed_at: 2026-08-28
verdict: PASS-WITH-NOTES
disclosure: OK
tier_check: 1
---

## Check 1 — Claim / Evidence Trace
**Result:** PASS

One factual claim is present in the artifact body.

1. **Claim:** "We built with that constraint front and center at tvScientific"
   - **Evidence trail entry:** source = https://interactivism.com/work/tvscientific-bringing-performance-to-ctv-advertising/, type = client-doc
   - **Verification:** Anchor URL confirmed live. Case study explicitly describes a dual-track design challenge: serving both sophisticated performance marketers and first-time advertisers — the constraint of one product serving both user types. The claim is directly supported. **PASS**

The remaining assertions in the body ("interface quality isn't just a UX concern — it directly affects whether advertisers self-serve or require hand-holding, and whether they stay or leave" and "BrightLine has the market position") are framing/opinion rather than factual claims requiring evidence — appropriate in a cold email context.


## Check 2 — Craft Bar
**Result:** PASS-WITH-NOTES

Directory listing of `/contracts/reference-set/`: README.md, case-study/, outbound/, proposal/, site-copy/, status-update/

The `outbound/` category matches this artifact type. Contents: aerospace-defense-sample-1.md through aerospace-defense-sample-4.md. No AdTech outbound samples.

Craft comparison:

- **Structure:** Third-touch insight-lead format — opens with a reframe, connects to credential, closes with an open door. Matches the value-deepening structure expected at this cadence point. PASS.
- **Length:** Shorter than touches 1–2, appropriate for touch 3. PASS.
- **Specificity:** "self-serve or require hand-holding" is specific to the AdTech context and connects directly to the case study. PASS.
- **Voice:** Consistent with prior touches. PASS.

PASS-WITH-NOTES: No AdTech outbound benchmark in reference set.


## Check 3 — Commitment Scan
**Result:** PASS

No pricing, timeline, or scope commitments in this touch.


## Check 4 — Disclosure Tripwire
**Result:** OK

Disclosure domain for program adtech is `null` per `programs/adtech/config.yaml`. Check skipped.


## Check 5 — Hygiene & Tier Verification
**Result:** PASS-WITH-NOTES

- **Frontmatter completeness:** `qec`, `tier`, `engagement`, `evidence_trail` all present. PASS.
- **Names in artifact body:** Salutation "Hi Tim," and signature block "Erik Wingren / Partner & Co-Founder / erik@interactivism.com / 323-528-0058." partner_ruling documented (same as Touch 1). Reviewer applies same assessment: documented Lead Partner ruling; not a rubric-defined mechanism; noted, not blocked. PASS-WITH-NOTES.
- **Tier:** Tier 1 correct for unsent draft per CLAUDE.md BD Engine policy. No escalation.
- **Internal references:** anchor_url verified live. No broken references.


## Verdict
**PASS-WITH-NOTES** — No FAIL results. Two notes (same as Touch 1):
1. Check 2: No AdTech outbound craft benchmark in reference set.
2. Check 5: Names in body covered by documented partner_ruling (not a rubric-defined mechanism; Lead Partner has explicitly ruled).

## Disposition
No blockers. Artifact may advance to Layer 3 human review with Lead Partner acknowledgment of the two notes above.
