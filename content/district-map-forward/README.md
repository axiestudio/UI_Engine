# district-map-forward — UI preset

Civic & Public Service / Service Landing, in the **District / Map-forward** visual direction (unslop.site reference). A civic "district compass" panel: an address lookup + ward map core, ledger stat tiles, representative card, public-meetings and ballot rails. Hard ink borders, square corners, uppercase mono micro-labels, cartographic detail.

**Design reference:** https://unslop.site/reference/district-map-forward

**Tokens:** reads standard shadcn HSL tokens (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--primary`, …) plus brand tokens `--district-blue` (map accent) and `--accent` (civic red). Square corners by default (`--radius: 0rem`).

```tsx
<DistrictMapForward
  county="Calder County"
  brand="District Compass"
  stats={[{ value: "Ward 6", label: "Council district" }, { value: "72.4%", label: "2024 turnout" }]}
  meetings={[{ title: "Budget hearing", date: "Jun 03" }]}
  ballot={[{ title: "Council, Ward 6", count: "2 cand." }]}
/>
```
