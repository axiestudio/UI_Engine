import * as React from "react"
import { motion, useMotionValue, useTransform, animate } from "motion/react"
import { LockKeyholeOpen, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      make "unlocking a code/tier" feel like breaking into a vault
// ═══ EMOTION  anticipation + the thunk of a bolt withdrawing
// ═══ SIGNATURE drag the dial (mouse/touch/arrow keys — it's a real slider);
//               it snaps to detents with magnetic springs and the bolts pull
//               back revealing the tier's code
//   SITE     → "unlock your discount" gamified waitlist/pricing band
//   APP      → reveal a secret/one-time key: gesture = intent gate, nicer
//              than a plain Show button, and keyboard-accessible via slider
//   A11Y     role=slider with aria-valuetext; arrow keys turn it; the unlocked
//            code is selectable text, never image-only

export type VaultTier = { label: string; code: string; hint?: string }

export type VaultDialProps = {
  eyebrow?: string
  title?: React.ReactNode
  tiers: VaultTier[]
  onUnlock?: (tier: VaultTier) => void
  resetLabel?: string
  className?: string
}

export function VaultDial({ eyebrow = "THE VAULT", title, tiers, onUnlock, resetLabel = "Spin again", className }: VaultDialProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const n = Math.max(2, tiers.length)
  const stepDeg = 360 / n
  const angle = useMotionValue(0)
  const counter = useTransform(angle, (v) => -v)
  const [index, setIndex] = React.useState(0)
  const [unlocked, setUnlocked] = React.useState(false)
  const dragging = React.useRef(false)
  const lastDelta = React.useRef(0)

  const snapTo = (i: number) => {
    const target = ((i % n) + n) % n
    setIndex(target)
    animate(angle, -target * stepDeg, reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18 })
    if (target > 0 && !unlocked) {
      const t = setTimeout(() => { setUnlocked(true); onUnlock?.(tiers[target]) }, reduce ? 0 : 620)
      return () => clearTimeout(t)
    }
    return undefined
  }

  const pointerAt = (e: { clientX: number; clientY: number }, host: HTMLElement) => {
    const r = host.getBoundingClientRect()
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (unlocked) return
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    lastDelta.current = pointerAt(e, e.currentTarget as HTMLElement)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || unlocked) return
    const a = pointerAt(e, e.currentTarget as HTMLElement)
    let d = a - lastDelta.current
    if (d > 180) d -= 360
    if (d < -180) d += 360
    lastDelta.current = a
    angle.set(angle.get() + d)
  }
  const onPointerUp = () => {
    dragging.current = false
    const nearest = Math.round(-angle.get() / stepDeg)
    snapTo(nearest)
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (unlocked) return
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); snapTo(index + 1) }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); snapTo(index - 1) }
  }

  const tier = tiers[index]

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--steel-deep))] px-4 py-20 text-white sm:px-6 lg:px-8", className)}>
      <div className="mx-auto grid w-full max-w-[1080px] items-center gap-12 lg:grid-cols-[auto_1fr]">
        {/* dial */}
        <div className="relative mx-auto size-[300px] shrink-0 select-none" style={{ perspective: 900 }}>
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,hsl(var(--steel)),hsl(var(--steel-deep))_70%)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8),inset_0_2px_6px_rgba(255,255,255,0.12)]" />
          {/* bolts */}
          {[0, 90, 180, 270].map((a) => (
            <motion.span
              key={a}
              aria-hidden
              animate={unlocked && !reduce ? { inset: "-18px" } : { inset: "-6px" }}
              transition={{ duration: 0.5, delay: 0.1 + (a / 90) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-gradient-to-b from-[hsl(var(--brass))] to-[hsl(var(--brass)/0.6)] shadow-lg"
              style={{ transform: `rotate(${a}deg) translateY(-92px)` }}
            />
          ))}
          {/* rotating face */}
          <motion.div
            role="slider"
            aria-label="Vault dial"
            aria-valuemin={0}
            aria-valuemax={n - 1}
            aria-valuenow={index}
            aria-valuetext={`${tier?.label ?? ""}${unlocked ? " — unlocked" : " — locked"}`}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            style={{ x: "-50%", y: "-50%", rotate: angle }}
            className="absolute left-1/2 top-1/2 size-[190px] cursor-grab touch-none rounded-full border-4 border-[hsl(var(--brass)/0.7)] bg-[repeating-conic-gradient(hsl(var(--steel))_0deg_10deg,hsl(var(--steel-deep))_10deg_20deg)] active:cursor-grabbing focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--brass)/0.5)]"
          >
            <motion.span
              aria-hidden
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: unlocked ? 0 : 1, y: 0 }}
              className="absolute inset-4 grid place-items-center rounded-full border-2 border-dashed border-white/15 bg-[hsl(var(--vault-face))] font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/50"
              style={{ rotate: counter }}
            >
              {unlocked ? null : "⟲ drag"}
            </motion.span>
            <span aria-hidden className="absolute left-1/2 top-2 h-7 w-1 -translate-x-1/2 rounded-full bg-[hsl(var(--brass))]" />
          </motion.div>
          {/* fixed top indicator */}
          <span aria-hidden className="absolute left-1/2 top-[-4px] -translate-x-1/2 border-x-8 border-t-[12px] border-x-transparent border-t-[hsl(var(--brass))]" />
        </div>

        {/* panel */}
        <div className="min-w-0">
          <MonoLabel className="text-[hsl(var(--brass))]">{eyebrow}</MonoLabel>
          {title && <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-[40px]">{title}</h2>}
          <ul className="mt-7 space-y-2">
            {tiers.map((t, i) => (
              <li key={t.label}>
                <button
                  type="button"
                  onClick={() => { if (!unlocked) snapTo(i) }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition-all",
                    i === index && !unlocked && "border-[hsl(var(--brass))] bg-[hsl(var(--brass)/0.08)]",
                    i === index && unlocked && "border-white/20 bg-white/10",
                    i > index && !unlocked && "cursor-pointer opacity-45 hover:opacity-70",
                    unlocked && i !== index && "opacity-25",
                    i === 0 && "cursor-not-allowed opacity-35",
                  )}
                >
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">{String(i).padStart(2, "0")} — {t.label}</span>
                  <span className="font-mono text-[11px] font-black">{!unlocked && i > 0 ? "••" : ""}</span>
                </button>
              </li>
            ))}
          </ul>
          <motion.div initial={false} animate={{ height: unlocked ? "auto" : 0, opacity: unlocked ? 1 : 0, marginTop: unlocked ? 24 : 0 }} transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="rounded-lg border border-[hsl(var(--brass)/0.5)] bg-black/30 p-5">
              <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[hsl(var(--brass))]">
                <LockKeyholeOpen className="size-4" /> bolt retracted — {tier?.label}
              </p>
              {tier?.hint && <p className="mt-2 text-sm font-medium text-white/60">{tier.hint}</p>}
              <div className="mt-3 flex items-center justify-between gap-4">
                <code className="rounded bg-white/10 px-4 py-2 font-mono text-lg font-black tracking-[0.2em]">{tier?.code}</code>
                <button
                  type="button"
                  onClick={() => { setUnlocked(false); snapTo(0) }}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
                >
                  <RotateCcw className="size-3.5" /> {resetLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
