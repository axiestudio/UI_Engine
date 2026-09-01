# feedback-widget — UI preset

Floating feedback widget: bottom-right pill → mood capture (Love it / Ok / Broken) → note → "Tack! Noted." → auto-close. Demoed inside a dashed stage so the floating widget never escapes the showcase. Reveals via Motion-Primitives `in-view`.

**Provenance:** Motion-Primitives `in-view` + `motion/react`; shadcn/ui button styles.

```tsx
<FeedbackWidget
  eyebrow="Chrome · Floating widget"
  title="How's it going?"
  subtitle="Tell us in four seconds."
/>
```
