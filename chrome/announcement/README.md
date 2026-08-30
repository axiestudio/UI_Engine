# announcement — UI preset

Site-wide announcement strip: single `string`, single message object with a two-word `roll` (TextRoll), or an array that rotates on a timer (TextLoop). `cta` chip, `border-trail` accent line, dismissal optionally persisted in `localStorage` under your `dismissKey`. Tone `ink` | `paper`.

**Provenance:** Watermelon `announcement-1`, `announcement-2` (verbatim), `button`/`badge`; Motion-Primitives `text-roll`, `text-loop`, `border-trail`, `magnetic`.

```tsx
<AnnouncementBar dismissKey="site-2026-summer" messages={["Summer slots open", "Free consult Fridays"]} cta={{ label: "Book", href: "/booking" }} />
<AnnouncementBar tone="paper" messages={{ before: "Open ", roll: ["today", "books"], after: " until 18:00" }} />
```
