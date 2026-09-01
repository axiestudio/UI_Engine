# commerce-financing

**JOB** — a monthly-installment estimator for any price.
**SIGNATURE** — term picked on a Radix Slider (vendored shadcn `slider` kit
file: drag, keyboard, ARIA semantics are Radix's); amortization math and
typography are ours.

## Sources

Vendored: shadcn/ui `slider` + `button` (new-york-v4 compositions on
`@radix-ui/react-slider`), motion-primitives (`in-view`), the in-repo
`handcraft` kit. Re-themes with the engine tokens.

```tsx
<CommerceFinancing price={1200} minTerm={3} maxTerm={36} apr={0.15} />
```
