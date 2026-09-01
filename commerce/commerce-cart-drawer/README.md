# commerce-cart-drawer

**JOB** — a slide-over cart with line items, steppers and totals.
**SIGNATURE** — Vaul-powered right-side drawer (drag-to-dismiss, portal, focus
trap, Radix Dialog semantics) with our rails, quantity steppers and totals.

## Sources

Vendored: shadcn/ui `button` (new-york-v4), Watermelon `drawer` (Vaul wrapper),
motion-primitives (`in-view`), the in-repo `handcraft` kit. Engine peer: `vaul`.
Re-themes with the engine tokens.

```tsx
<CommerceCartDrawer lines={[{ id: "l1", name: "Linen apron", price: 640, qty: 1 }]} />
```
