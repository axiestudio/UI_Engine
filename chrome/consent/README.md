# consent — UI preset

GDPR cookie consent: bottom banner (ink/paper) with Accept all / Reject all / Preferences, preferences dialog with per-category switches (required categories locked), localStorage persistence, slide-up entrance. Uncontrolled — reads/writes a single storage key, calls `onDecision` with the result so sites can act on it.

**Provenance:** shadcn/ui `new-york-v4` (`button`, `switch`, `dialog`, `separator`, `card`); Motion (entrance via `motion/react` AnimatePresence, reduce-motion aware).

```tsx
<Consent
  storageKey="my-consent"
  onDecision={(r) => console.info(r.accepted, r.categories)}
/>
```
