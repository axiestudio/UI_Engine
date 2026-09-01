# applause-meter

**JOB** — make a rating feel earned: proof with a pulse.
**SIGNATURE** — an amplitude equalizer whose bars lean toward the score, a
spring-driven count-up verdict rendered by vendored React Bits `CountUp`
(no hand-rolled rAF tweens), and a standing-ovation line above 4.7.

## Sources

Original section design + handcraft kit; vendored `react-bits:CountUp-TS-TW`.
Motion via `motion/react`. `prefers-reduced-motion` → instant count. Re-themes
with the engine tokens.

```tsx
<ApplauseMeter value={4.8} count={312} />
```
