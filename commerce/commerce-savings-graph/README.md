# commerce-savings-graph

**JOB** — an animated bar chart of cost savings over time.
**SIGNATURE** — Bklit `bar-chart` (vendored with its recursive registry chain:
chart-context, animation, grid, tooltip): grow-in reveal, x/y axes, crosshair
tooltip — the highlighted base case is expressed via the second series fill.

## Sources

Vendored: Bklit `bar-chart`, `chart-context`, `chart-animation`, `grid`,
`chart-tooltip`, `utils`, `chart-utils`; shadcn/ui `button` (new-york-v4),
motion-primitives (`in-view`), handcraft kit. npm peers: `@visx/*`, `d3-array`,
`@number-flow/react`, `motion`. Chart tokens live in `src/index.css`.

```tsx
<CommerceSavingsGraph bars={[{ id: "b1", label: "Jan", value: 42 }, { id: "b4", label: "Apr", value: 74, highlight: true }]} />
```
