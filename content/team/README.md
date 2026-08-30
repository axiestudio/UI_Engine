# team — UI preset

Staff grid: 4:5 avatar (initials fallback on missing/broken src), role mono line, credential tag chips over the image, optional bio (`showBios`), link icons (pass `icon`, defaults to `Mail` for mailto). Optional subtle `Tilt` hover. Staggered InView reveal.

**Provenance:** Watermelon `team-1`, `team-2` (verbatim; lucide v1 brand-icon removal patched at the icon-map only, API unchanged), `card`/`badge`/`button`; Motion-Primitives `tilt`, `in-view`.

```tsx
<Team members={[{ name: "Astrid", role: "Physio", tags: ["25 yrs"], links: [{ label: "Mail", href: "mailto:…" }] }]} />
```
