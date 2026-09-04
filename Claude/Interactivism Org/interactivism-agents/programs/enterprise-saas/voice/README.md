# AdTech Program — Voice Corpus

**Status: EMPTY — must be assembled before program activation.**

The operating Partner has not yet been assigned for this program. Voice samples cannot be fabricated; they must come from the operating Partner themselves.

## What is needed before activation

At least **3 voice samples** of any combination:

| Type | What to provide | Where to save |
|---|---|---|
| `email-sample` | An outreach email you've actually sent (or would have sent) to an AdTech/CTV prospect — preferably one that got a reply | `programs/adtech/voice/sample-email-<N>.md` |
| `proposal-excerpt` | A paragraph or section from a proposal you wrote that represents your voice in a pitch context | `programs/adtech/voice/sample-proposal-<N>.md` |

## Format for each sample

```markdown
# Voice Sample [N] — [Type] — [Brief hook description]
# Type: email-sample | proposal-excerpt
# Program: adtech
# Approved by: [operating Partner] — [date]

---

[The actual text of the sample]

---
# Notes for R3 (optional): any specific patterns R3 should notice in this sample
```

## Why this cannot be fabricated

The sequence operator (R3) writes in the first-person voice of the operating Partner. If R3 invents a voice rather than learning one from real samples, the outreach will not sound like the Partner who is sending it. The operating Partner's professional reputation is attached to every email that goes out; a fabricated voice is a breach of that.

R3 will refuse to draft any email until this corpus contains at least 3 approved samples. The check is structural and cannot be bypassed.

## Activation sequence

1. Assign `operating_partner` in `programs/adtech/config.yaml`
2. Add ≥3 approved voice samples to this directory
3. Run Tier-2 QEC consult on sequence templates (Second-Partner async, 48-business-hour window)
4. Set `status: active` in the config
5. R2 can then begin prospecting; R3 can then begin drafting
