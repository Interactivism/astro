# Pipeline Fill Report — AdTech — 2026-08-25

## Counts by Stage
| Stage | Count | Delta (7d) |
|---|---|---|
| prospect-new | 0 | 0 |
| prospect-enriched | 15 | +15 |
| sequence-active | 0 | 0 |
| replied | 0 | 0 |
| interested | 0 | 0 |
| booked | 0 | 0 |
| qualified | 0 | 0 |
| disqualified | 0 | 0 |
| suppressed | 0 | 0 |

## List Health
- Records with verified email: 15 / 15
- Records with stale signal (>6mo): 0
- Records with missing required fields: 0
- Duplicate flags: 0

## Added This Week
- 15 new records researched and enriched in a single R2 pass
- 0 records enriched from existing pipeline
- 1 record flagged (`icp-edge-case`): leonardo-schiavina-topsort — contact is Spain-based despite US company HQ

## ICP Segment Coverage
| Segment | Companies | Contacts |
|---|---|---|
| CTV / streaming | Infillion, BrightLine, [cognition] | 6 |
| Podcast attribution / measurement | Podscribe, Magellan AI | 4 |
| Retail media | Topsort | 1 |
| Programmatic DOOH / OOH | Onescreen | 1 |
| Publisher ad tech | Aditude | 1 |
| Data clean rooms | — | 0 |
| Ad verification | — | 0 |
| Campaign management | — | 0 |

## Fit Score Distribution
| Score | Count |
|---|---|
| 5 | 4 |
| 4 | 6 |
| 3 | 5 |

## Companies Screened and Disqualified (not in pipeline)
The following companies were identified during the search pass but disqualified before enrichment:

| Company | Reason |
|---|---|
| Start.io | People search returned no product/design leadership; contacts were sales/finance only |
| Choozle | People search returned no product/design leadership |
| Adtelligent | People search returned no product/design leadership |
| SmartyAds | People search returned no product/design leadership |
| Madhive | People search returned no product/design leadership |
| TripleLift | Acquired by Vista Equity Partners (PE-owned with scale beyond ICP) |
| Pinterest Ads | Walled garden (Pinterest acquired) |
| Flashtalking | Acquired by Mediaocean; non-independent platform |

## Credit Spend
- Company searches: 3 credits (3 pages × 1 credit/page)
- People enrichment (apollo_people_bulk_match): 15 credits (15 verified contacts × 1 credit)
- **Total this run: 18 credits**
- Estimated remaining balance: ~127 of 145 lead credits

## Notes for Operating Partner
1. **Leonardo Schiavina (Topsort)** — flagged `icp-edge-case`. Topsort is US-HQ (San Francisco) but this contact is LinkedIn-located in Spain. Recommend partner review before including in any sequence. A US-based Topsort design/product contact would be a stronger entry point if one can be identified.
2. **Segment gaps** — Data clean rooms, ad verification, and campaign management segments have zero coverage in this pass. Recommend a follow-on search pass targeting: LiveRamp Habu (data clean rooms, if size-band eligible), DoubleVerify (verify employee count / PE status before including), and Kenshoo/Skai or Basis Technologies (campaign management).
3. **Infillion density** — Four contacts from one company. If Infillion responds, the one-active-conversation-per-company policy (CRM conventions §4) applies; non-responding contacts at Infillion should be suppressed once a conversation opens.
4. **Voice corpus prerequisite** — R3 (outbound-sequence-writer) requires ≥3 voice samples in `programs/adtech/voice/` before drafting can begin. This fill report completes the R2 obligation; voice collection is the next activation-checklist dependency.
