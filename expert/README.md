# expert — UI preset

**Job:** turn a name into a person you'd trust in a quiet room.
**Emotion:** warmth + competence. Unhurried.
**Signature move:** the sticky portrait — the face *stays* while the biography scrolls past it, so you read about the therapist with the therapist on the page. Mobile: full-width band, text below (sticky columns are a desktop grammar).

**Craft:**
- Type: name over the photo in display-black with a scrim; mono uppercase role; bio 15px `leading-[1.75]` (editorial, not UI-paragraph); the pull-quote in display 22px with an oversized hanging “ glyph at 25% ink.
- Rhythm: 5:7 column split, 64px gap, big mono counter (56px, tabular) anchors the grid top — *years*, not buzzwords.
- Texture: hairline + soft shadow on the portrait only; the text column has no surfaces at all — the trust is the copy.
- Motion: staggered InView per paragraph; availability dot; Magnetic CTA. Reduced-motion: everything visible instantly.
- Details: photo fallback = initials block (never a broken icon); `aria-labelledby` on the section; availability dot is decorative + text states it for SR.

**Provenance:** Watermelon `expandable-profile-card` (base, verbatim `ExpandableProfileCard`) · Motion-Primitives `magnetic`, `tilt`, `in-view`.

```tsx
<Expert
  name="Astrid Lindqvist" role="founder · deep tissue"
  photo="/astrid.webp" quote="Your back tells the truth sooner than you do."
  bio={["24 years...", "Certified..."]} tags={["Svenska","English","Cert. 200h"]}
  counter={{ value: "24", label: "years at the table" }}
  availability="Books Tuesdays & Fridays"
  cta={{ label: "Book with Astrid", href: "/booking" }}
/>
```
