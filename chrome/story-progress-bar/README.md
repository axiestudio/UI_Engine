# story-progress-bar — UI preset

Instagram-style story strip: timed slide progression with segmented progress bars, hold-to-pause, edge-tap navigation and caption rail. Motion and reduced-motion aware.

**Provenance:** Motion-Primitives `in-view`; progress/timing choreography via `motion/react`.

```tsx
<StoryProgressBar
  title="Studio story"
  slides={[
    { src: "/showcase/gallery-01.webp", caption: "Chair one · morning cut" },
    { src: "/showcase/gallery-02.webp", caption: "The colour bar · mid-mix" },
  ]}
  duration={3500}
/>
```
