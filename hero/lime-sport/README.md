# lime-sport — UI preset

Training-club landing for runners in the **Lime / Sport** visual direction (unslop.site reference). Near-black green `#0a0f00` + electric lime `#d4f000`, Archivo Black 900 display type, uppercase micro-labels, live stat widgets (pace / members) and a lime marquee ticker. Props-driven, token-only, responsive.

**Design reference:** https://unslop.site/reference/lime-sport

```tsx
<LimeSport
  brand="PACE//FORM"
  lineA="RUN HARDER."
  stats={[{ label: "Avg pace · this week", value: "5:42", delta: { dir: "up", text: "0:14 vs last wk" } }]}
/>
```
