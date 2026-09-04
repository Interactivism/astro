---
type: voice-corpus
subtype: edit-pattern-analysis
program: adtech
source_sequences:
  - joy-lin-infillion (touches 1–5)
  - adam-holt-cognitionads (touches 1–5)
  - peter-birsinger-podscribe (touches 1–5)
  - cameron-hendrix-magellan (touches 1–5)
  - greg-wise-onescreen (touches 1–5)
compiled: 2026-08-28
compiled_by: partner.erik (manual edits) + operator (pattern extraction)
---

# AdTech Outbound — Voice Edit Patterns

This file documents what partner.erik's manual edits to the R3 batch reveal about voice preferences, tone, and accuracy standards. Use it to calibrate future R3 runs.

---

## 1. Engagement Currency — Signal Ongoing, Not Concluded

**Pattern:** The phrase "We spent [N] years at tvScientific" reads as a completed engagement. Partner consistently edits to signal the relationship is active.

**Fixes applied:**
- "We spent six years at the core of tvScientific" → "We spent the **last** six years at the core of tvScientific"
- "right up to the Pinterest acquisition in February" → "and the Pinterest acquisition in February" (removing the "right up to" implies the acquisition ended the relationship)

**Rule for R3:** Always use "the last [N] years" construction. Never use "right up to [event]" as a closing phrase — it implies the event was a terminus. Preferred form: "...and [event]."

---

## 2. Accurate Year Count — 2020 to 2026 is Six Years

**Pattern:** R3 defaulted to "five years" throughout the batch. The correct figure is six years (inception 2020 → 2026).

**Fixes applied:**
- "We spent five years designing tvScientific's platform" → "We spent **six** years" (Joy Lin)
- Tim Farrer: "five years" → "six years" (caught in QEC)

**Rule for R3:** tvScientific engagement = **six years** (2020–2026). Never write "five years." Verify arithmetic before writing year counts.

---

## 3. No Overgeneralization — Hedge Industry Claims

**Pattern:** R3 wrote universals ("every CTV ad platform," "at the heart of"). Partner edited to hedged statements that are more accurate and less presumptuous.

**Fixes applied:**
- "That dual-audience problem lives at the heart of every CTV ad platform." → "That's a problem that shows up across CTV platforms." (Joy Lin touch-1)
- Tim Farrer QEC: "That dual-audience problem lives at the heart of every CTV ad platform." → "It's a problem that shows up in a lot of CTV ad platforms, though not all."

**Rule for R3:** Do not claim every platform has any given problem. Use "across," "in a lot of," "tends to show up in" — never "every" or "all." The hedge is more honest and more persuasive.

---

## 4. No Fundraising Stage Inference Without Evidence

**Pattern:** R3 inferred Cameron Hendrix (Magellan AI) was pre-Series A and used "pre-fundraise" framing. Research showed Magellan is seed-stage running on ~$5.5M ARR with no public Series A signal. The framing was inference, not fact.

**Fix applied:**
- "pre-fundraise tends to be when that investment makes the most leverage" → "companies at your stage often find it's the right moment to sharpen the product interface before the next phase of growth."

**Rule for R3:** Never infer fundraising trajectory from company stage or ARR data. Use neutral "next phase of growth" or "as you scale" framing unless the pipeline record explicitly flags an imminent raise with a source.

---

## 5. Touch-2 = Soft Ping Only

**Pattern:** Touch-2 should be short — one sentence of context, one calendar link, one exit ramp. No new substantive content.

**Observed in edited sequences:**
- Joy Lin touch-2: 3 sentences total. "Wanted to follow up briefly — I know inboxes can be noisy. If the timing's off or this isn't a fit right now, no problem at all. But if you're curious, happy to do a quick call."
- Adam Holt touch-2: 2 sentences + link. "Following up briefly — I know the pace of a fast-scaling platform doesn't leave much room for cold emails."
- Cameron Hendrix touch-2: 2 sentences + link. "Quick follow-up — I know founder inboxes aren't exactly empty."

**Rule for R3:** Touch-2 = brief + link + exit ramp. No new problem framing, no new credential, no additional proof points. Acknowledge why the person is busy (calibrate to their context: platform pace, founder inbox, etc.).

---

## 6. Honest About Category Adjacency

**Pattern:** Onescreen is DOOH, not CTV. Rather than overclaiming relevance, the touch explicitly names the adjacency and its limits.

**Observed in greg-wise-onescreen touch-3:**
> "We haven't worked directly in OOH, but the underlying challenge — building an interface for buyers at very different sophistication levels transacting across a new medium — is close to what we spent five years on at tvScientific for CTV."

**Rule for R3:** When the prospect's category differs from the credential anchor (CTV), acknowledge the gap honestly and map the structural overlap. "We haven't worked directly in X, but the underlying challenge is close to..." is the preferred pattern. Don't claim direct experience you don't have.

---

## 7. Touch-4/5 — Brief, Graceful Exit

**Pattern:** Partner kept touches 4 and 5 very short. No new content, just an open door and a dignified close.

**Touch-4 pattern:** "Still happy to connect whenever the timing makes sense — no pressure. [One sentence about the relevance trigger.] [Calendar link]"

**Touch-5 pattern:** "Last note from me — [reason for stopping]. If [trigger] ever [becomes relevant], I'm easy to find: [email] or [calendar link]. [Warm close]."

**Rule for R3:** Touches 4 and 5 should never introduce new proof points, problems, or arguments. The only acceptable content is: acknowledge timing, leave door open, provide contact info, close warmly.

---

## 8. Prospect-Specific Framing — Use the Signal

**Pattern:** Each sequence uses the prospect's specific growth signal and product category as the frame, not a generic AdTech opener.

**Observed differences:**
- Joy Lin (Infillion, CTV, +22% in 6 months): frame = design surface expanding faster than investment
- Adam Holt ([cognition], CTV DSP, +88% in 24 months): frame = engineering output outrunning design layer
- Peter Birsinger (Podscribe, podcast attribution, +83% in 24 months): frame = data is the product but interface determines trust
- Cameron Hendrix (Magellan AI, podcast intelligence, +6% in 6 months): frame = intelligence feels effortless vs. requires too much work
- Greg Wise (Onescreen, DOOH, +39% in 24 months): frame = DOOH mental model doesn't transfer from digital

**Rule for R3:** Touch-1 must use the prospect's specific signal (growth rate, product category, audience challenge) as the problem frame. Generic AdTech opening is not acceptable.
