# schedule — UI preset

Opening hours + next-available slots on one tokenized card: live "Open now — until 18:00" dot, today row highlighted (Mon-first `todayIndex` default), slot radiogroup, Magnetic book button (disabled until selection) handing `{day, time}` to host `onBook` — no booking system baked in.

**Provenance:** Watermelon `schedule-button`, `schedule-date`, `schedule-date-base` (exported verbatim but demo-grade — fixed dates/colors; the production component is composed from tokens per house style), `button`; Motion-Primitives `magnetic`, `in-view`.

```tsx
<Schedule week={HOURS} slots={[{ day: "Today", time: "16:30" }]} onBook={(s) => bokadirekt(s)} />
```
