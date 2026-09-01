# pricing-addons

**JOB** — bolt-on extras for a plan card with a live tally.
**SIGNATURE** — every row is flipped by the vendored shadcn/Watermelon `switch`
kit file (Radix Switch: checked state, focus ring, disabled semantics — no
hand-rolled toggle), the summary and total move with it.

## Sources

Vendored: Watermelon `switch` (`@radix-ui/react-switch`), motion-primitives
(`in-view`), the in-repo `handcraft` kit. Re-themes with the engine tokens.

```tsx
<PricingAddons plan="Studio" basePrice={649} addons={[{ id: "sms", label: "SMS reminders", price: 80 }]} />
```
