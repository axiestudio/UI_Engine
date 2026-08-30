# video-demo — UI preset

Video demo section: browser-chrome framed poster with play overlay; opens a lightbox dialog rendering an embed `iframe` or native `<video>` (set `direct`). `ink` (default) or `paper`.

**Provenance:** shadcn/ui `new-york-v4` (`button`, `dialog`, `card`); Motion-Primitives `in-view`.

```tsx
<VideoDemo
  poster="/demo-poster.webp"
  src="https://www.youtube.com/embed/VIDEO_ID"
  caption="90-second walkthrough — no signup required."
/>
```
