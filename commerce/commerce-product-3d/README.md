# commerce-product-3d

**JOB** — a product face that tilts in 3D as you move the pointer.
**SIGNATURE** — pointer-tracked spring tilt via vendored React Bits
`TiltedCard` (caption tooltip, mobile fallback included); colorway picker,
price and CTA composed by the section.

## Sources

Vendored: `react-bits:TiltedCard-TS-TW`; shadcn/ui `button` (new-york-v4),
motion-primitives (`in-view`), handcraft kit. Motion via `motion/react`.

```tsx
<CommerceProduct3d colorways={[{ id: "ink", label: "Ink", swatch: "hsl(var(--foreground))", src: "/frames/frame_0002.webp" }]} />
```
