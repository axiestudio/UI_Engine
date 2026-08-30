# visit-us — UI preset

Location / visit section: Google Maps embed (NO API key) in a **2:1 grid** (map spans 2, info rail 1), mobile-first stack.

## Provenance
| Source | Item |
| --- | --- |
| Watermelon UI registry | `view-on-map`, `view-on-map-base`, `button` → `src/components/{watermelon,ui}` |
| Motion-Primitives | `InView`, `Tilt` → `src/components/primitives` |

## Use
```tsx
<VisitUs
  address={["Trädgårdsgatan 12", "553 16 Jönköping"]}
  phone="070 993 48 93"
  email="hei@example.com"
  hours={[{ day: "Mon", hours: "09–18" }, { day: "Sat", closed: true }]}
  mapImageUrl="/static/map.jpg"
/>
```
- `mapQuery` overrides the embedded search query; `zoom`, `todayIndex` (Monday-first), labels (`todayLabel`, `closedLabel`, `directionsLabel`, `copyLabel`) are all props — no business copy baked in.
- `ViewOnMap` (expanding pill → map sheet) is exported standalone.
- Copy buttons use `navigator.clipboard` with Check confirmation; directions open Google Maps `dir` URL.

## Themes / tokens
shadcn-style CSS variables + `.dark`, same brandkit tokens as `header`/`hero-scroll`. Reduced motion respected by `InView` once-triggers.

Build: `npm run build --workspace=UI/visit-us` → `dist/visit-us.{es,cjs}.js + visit-us.css` (+ `import "visit-us/styles.css"`).
