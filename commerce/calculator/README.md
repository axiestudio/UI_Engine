# calculator

**JOB** — a purpose-built quote estimator (units × rate, monthly/annual).
**SIGNATURE** — quantity chosen on a keyboard-accessible slider: mechanics
(pointer, ARIA, arrow keys) belong to Radix Slider via the vendored shadcn
`slider` kit file. Segmented cadence control with `aria-pressed`.

## Sources

Vendored: shadcn/ui `slider` + `button` (new-york-v4 compositions on
`@radix-ui/react-slider` / `radix-ui`), motion-primitives (`in-view`), the
in-repo `handcraft` kit. Re-themes with the engine tokens.

```tsx
<Calculator unit="sections" rate={45} min={1} max={20} />
```
