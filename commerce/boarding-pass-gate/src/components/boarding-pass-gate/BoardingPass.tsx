import * as React from "react"
import { motion } from "motion/react"
import { Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import { Grain, CornerTicks, MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      hand the buyer their ticket — make an offer feel issued
// ═══ EMOTION  ownership before payment ("this seat is already yours")
// ═══ SIGNATURE a scanline sweeps the barcode once and it mutates from stub
//               bars into a QR — the pass "activates"
//   SITE      → event/family-offer section (the pass IS the CTA)
//   APP       → wallet/check-in screen (sealed after purchase, show the code)
//   A11Y      pass is a list of real text; barcode is decorative; code shown
//             in mono text too, never graphic-only; reduced-motion skips scan

export type BoardingPassData = {
  holder: string
  from: string
  to: string
  when: string
  seat?: string
  code: string
  validUntil?: string
  stamp?: string
}

export type BoardingPassProps = {
  eyebrow?: string
  title?: React.ReactNode
  pass: BoardingPassData
  cta?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

export function BoardingPass({ eyebrow = "ISSUED — NOT YET CLAIMED", title, pass, cta, className }: BoardingPassProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [scanned, setScanned] = React.useState(reduce)
  React.useEffect(() => {
    if (reduce) return
    const t = setTimeout(() => setScanned(true), 2200)
    return () => clearTimeout(t)
  }, [reduce])

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background px-4 py-24 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto w-full max-w-[760px]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
            {title && <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-[40px]">{title}</h2>}
          </div>
          <span className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:block">{pass.seat ?? ""}</span>
        </div>

        <motion.div initial={reduce ? undefined : { y: 18, opacity: 0, rotate: -0.4 }} animate={{ y: 0, opacity: 1, rotate: reduce ? 0 : -0.4 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative select-none">
          <div className="relative flex overflow-hidden rounded-lg border-2 border-[hsl(var(--pass-ink))] bg-[hsl(var(--pass-paper))] text-[hsl(var(--pass-ink))] shadow-[10px_12px_0_-2px_hsl(var(--pass-ink))]">
            <Grain opacity={0.045} />
            {/* main stub */}
            <div className="relative min-w-0 flex-1 px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em]">
                  <Plane className="size-3.5 -rotate-45" strokeWidth={2.6} /> {pass.from} → {pass.to}
                </span>
                {pass.stamp && (
                  <span className="-rotate-[8deg] border-2 border-[hsl(var(--pass-accent))] px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-[hsl(var(--pass-accent))]">{pass.stamp}</span>
                )}
              </div>
              <p className="mt-5 font-display text-[30px] font-black leading-none tracking-tight sm:text-[38px]">{pass.holder}</p>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.24em] opacity-55">Passenger</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                <Field label="When" value={pass.when} wide />
                {pass.seat && <Field label="Seat" value={pass.seat} />}
                {pass.validUntil && <Field label="Valid thru" value={pass.validUntil} />}
              </dl>
              <CornerTicks size={10} offset={6} className="text-[hsl(var(--pass-ink))]/50" corners={["tl", "bl"]} />
            </div>

            {/* perforation */}
            <div aria-hidden className="relative w-0 border-l-2 border-dashed border-[hsl(var(--pass-ink))]/50">
              <span className="absolute -top-2.5 left-1/2 size-5 -translate-x-1/2 rounded-full bg-background" />
              <span className="absolute -bottom-2.5 left-1/2 size-5 -translate-x-1/2 rounded-full bg-background" />
            </div>

            {/* scan stub */}
            <div className="relative flex w-[30%] min-w-[148px] flex-col items-center justify-center gap-3 px-4 py-6">
              {!scanned ? (
                <div className="relative h-[104px] w-full overflow-hidden" aria-hidden>
                  <Bars />
                  <motion.span
                    initial={{ top: 0 }}
                    animate={{ top: ["-12%", "108%"] }}
                    transition={{ duration: 1.4, times: [0, 1], repeat: Infinity, repeatDelay: 0.2, ease: "easeInOut" }}
                    className="absolute inset-x-0 h-3 bg-[hsl(var(--pass-accent))]/25 shadow-[0_0_12px_hsl(var(--pass-accent)/0.5)]"
                  />
                </div>
              ) : (
                <motion.span initial={reduce ? undefined : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                  <Qr code={pass.code} />
                </motion.span>
              )}
              <span className="font-mono text-[10px] font-bold tracking-[0.14em]">{pass.code.toUpperCase()}</span>
              {cta && (
                <a
                  href={cta.href ?? "#"}
                  onClick={cta.onClick}
                  className="mt-1 w-full rounded-sm bg-[hsl(var(--pass-ink))] px-3 py-2 text-center font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--pass-paper))] transition-transform hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--pass-accent))]"
                >
                  {cta.label}
                </a>
              )}
            </div>
          </div>
        </motion.div>
        <p className="sr-only">Pass for {pass.holder}, {pass.from} to {pass.to}, {pass.when}. Code {pass.code}.</p>
      </div>
    </section>
  )
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn(wide && "col-span-2 sm:col-span-1")}>
      <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] opacity-50">{label}</dt>
      <dd className="mt-0.5 truncate text-[15px] font-bold">{value}</dd>
    </div>
  )
}

// deterministic pseudo-barcode from the code string
function Bars() {
  const src = "010110010110100110010110"
  return (
    <svg viewBox="0 0 120 104" className="h-full w-full" aria-hidden>
      {Array.from({ length: 26 }, (_, i) => {
        const w = 1 + ((i * 7919) % 3)
        return <rect key={i} x={i * 4.5 + 4} y={10} width={w} height={84} fill="hsl(var(--pass-ink))" opacity={src[i % src.length] === "1" ? 0.95 : 0.55} />
      })}
    </svg>
  )
}

// tiny decorative QR-like matrix seeded from the code text
function Qr({ code }: { code: string }) {
  const n = 15
  const cells: boolean[] = []
  let h = 2166136261
  for (const ch of code) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0 }
  for (let i = 0; i < n * n; i++) { h ^= h << 13; h ^= (h >>> 17) ^ (h << 5); h = h >>> 0; cells.push((h & 0xff) > 108) }
  const isEye = (r: number, c: number) => (r < 3 && c < 3) || (r < 3 && c > n - 4) || (r > n - 4 && c < 3)
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="size-[104px]" aria-hidden>
      <rect width={n} height={n} fill="hsl(var(--pass-paper))" />
      {cells.map((on, i) => {
        const r = Math.floor(i / n), c = i % n
        if (isEye(r, c)) {
          const corner = r < 3 && c < 3 ? [0, 0] : r < 3 && c > n - 4 ? [0, n - 3] : [n - 3, 0]
          if (r === corner[0] && c === corner[1]) return <rect key={i} x={corner[0]} y={corner[1]} width={3} height={3} fill="hsl(var(--pass-ink))" />
          return null
        }
        return on ? <rect key={i} x={c} y={r} width={0.92} height={0.92} fill="hsl(var(--pass-ink))" /> : null
      })}
      {/* eye cores */}
      {[[1, 1], [n - 2, 1], [1, n - 2]].map(([x, y], i) => <rect key={`e${i}`} x={x} y={y} width={1} height={1} fill="hsl(var(--pass-paper))" />)}
    </svg>
  )
}
