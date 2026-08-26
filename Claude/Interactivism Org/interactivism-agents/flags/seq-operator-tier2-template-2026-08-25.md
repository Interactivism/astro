---
flag_type: seq-operator-tier2-template
date: 2026-08-25
program: adtech
drafted_by: outbound-sequence-operator
routes_to: second-partner
status: pending
---

# Tier-2 QEC Flag — New Sequence Templates

## What was drafted

A full 5-touch email sequence for Tim Farrer (Director of Product Design, BrightLine) was drafted as the first sequence template for the AdTech program. Files written:

- `programs/adtech/sequences/tim-farrer-brightline/touch-1.md` (Day 0)
- `programs/adtech/sequences/tim-farrer-brightline/touch-2.md` (Day 4)
- `programs/adtech/sequences/tim-farrer-brightline/touch-3.md` (Day 10)
- `programs/adtech/sequences/tim-farrer-brightline/touch-4.md` (Day 18)
- `programs/adtech/sequences/tim-farrer-brightline/touch-5.md` (Day 28)

All five files carry `qec: pending, tier: 1` in frontmatter.

## Why this flag is required

These are new sequence templates — the first drafted for the AdTech program. Per agent definition escalation rules:

> "New sequence TEMPLATE or any change to credential-anchor claims: → Tier 2 QEC (write `flags/seq-operator-tier2-template-<date>.md`; async Second-Partner consult before use)."

The credential anchor used (tvScientific / `cred.adtech`) appears in all five touches. The Second Partner must review before any touch is sent by the operating Partner.

## Required action

**Second Partner:** Async review of all five touch files above. Confirm:
- Voice is consistent with the operating Partner's identity
- Credential anchor claims are accurate and appropriately scoped
- Personalization signal (BrightLine +4% headcount growth, market-leader position in CTV interactive ad creative) is used correctly
- No agency-speak or fabricated credentials present

No touch may be sent until Second-Partner consult is complete and operating Partner has approved.

## Routing

Per `contracts/register.yaml`: Second Partner seat. No individual names. Operating Partner assigns for the async consult.
