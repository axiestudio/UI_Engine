# pricing — UI preset

Pricing tiers with a monthly/yearly `Switch`, "Most popular" plan ring, included/excluded feature lists (line-through), `Magnetic` CTAs and a per-period label. Numbers format via `toLocaleString`; strings render exactly as passed (`"99 kr"`, `"Free"`, `null` → "—").

**Provenance:** Watermelon `pricing-1`, `pricing-3` (verbatim), `switch`/`badge`/`button`; Motion-Primitives `magnetic`, `text-loop`, `in-view`.

```tsx
<Pricing defaultYearly currency="kr" plans={[
  { name: "Single", priceMonthly: 890, priceYearly: null, billingPeriodLabel: { monthly: "/ 60 min" }, cta: { label: "Book" }, features: [{ label: "Everything", included: true }] },
  { name: "Club", popular: true, priceMonthly: 690, priceYearly: 7020, cta: { label: "Join" } },
]} />
```
