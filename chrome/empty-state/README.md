# empty-state — UI preset

Empty states: icon chip, title, description, primary/secondary guidance actions and numbered next-step tips. Bordered card (default) or bare; `paper` (default) or `ink`.

**Provenance:** shadcn/ui `new-york-v4` (`button`, `card`).

```tsx
<EmptyState
  icon={CalendarPlus}
  title="No sessions yet"
  description="Your calendar is empty — create your first bookable session."
  primaryAction={{ label: "Create session", href: "/sessions/new" }}
  secondaryAction={{ label: "Import from CSV" }}
  tips={["Pick your weekly availability first", "Connect payments to charge at booking"]}
/>
```
