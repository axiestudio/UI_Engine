# commerce-quickview

**JOB** — a product grid whose cards open a detail modal without leaving the page.
**SIGNATURE** — Vendored shadcn/Watermelon `dialog` (Radix Dialog semantics: portal,
focus trap, Escape/outside dismissal) with motion spring transitions; layout and copy ours.

## Sources

Vendored: shadcn/Watermelon `button`, `dialog` (unified `radix-ui`), motion-primitives
(`in-view`), the in-repo `handcraft` kit. Re-themes with the engine tokens.

```tsx
<CommerceQuickview items={[{ id: "p1", name: "Oak desk lamp", price: "1 240 kr" }]} />
```
