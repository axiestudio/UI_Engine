import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { AlertTriangle, Check, KeyRound, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      make 2FA feel like a safety-critical airlock cycle
// ═══ EMOTION  competence under pressure — nothing opens until it's SEALED
// ═══ SIGNATURE two concentric doors: cycling the outer iris; inner doors
//               refuse until a pressure gauge completes; then both part in
//               sequence with caution-stripe frames
//   SITE     → auth section with a memorable security identity
//   APP      → the actual 2FA step: drive with `stage` prop
//             ("idle" → "sealed" → "open") and render your own widgets as
//             the inner panel's children
//   A11Y     real form controls, states mirrored as aria-live text; door
//            motion is CSS transforms, reduced = fades only

export type AirlockStage = "idle" | "sealed" | "open"

export type AirlockProps = {
  title?: React.ReactNode
  intro?: React.ReactNode
  /** Controlled from your auth flow; omit for a built-in demo flow. */
  stage?: AirlockStage
  codeLength?: number
  onVerify?: (code: string) => boolean | Promise<boolean>
  innerPanel?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

const STRIPES = "repeating-linear-gradient(45deg, hsl(var(--warn)/0.9) 0 10px, hsl(var(--hull-deep)) 10px 20px)"

export function Airlock({ title = "Two doors. One truth.", intro, stage: stageProp, codeLength = 6, onVerify, innerPanel, children, className }: AirlockProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [inner, setInner] = React.useState<AirlockStage>("idle")
  const stage = stageProp ?? inner
  const [code, setCode] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < codeLength) return
    setBusy(true); setError(false)
    const ok = onVerify ? await onVerify(code) : true
    setBusy(false)
    if (ok) {
      setInner("sealed")
      if (inner === "sealed" || !stageProp) setTimeout(() => setInner("open"), 2600)
    } else setError(true)
  }

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--hull))] px-4 py-20 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto grid w-full max-w-[1080px] items-center gap-10 lg:grid-cols-[1fr_460px]">
        <div>
          <MonoLabel className="text-[hsl(var(--hull-deep))]"><Lock className="mr-1 inline size-3" /> SECURITY · AIRLOCK PROTOCOL</MonoLabel>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-[hsl(var(--hull-deep))] sm:text-[40px]">{title}</h2>
          {intro && <p className="mt-3 max-w-md text-[15px] font-medium leading-relaxed text-[hsl(var(--hull-deep))]/70">{intro}</p>}
          <ul className="mt-6 space-y-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
            {([["Outer door", stage !== "idle"], ["Pressure seal", stage !== "idle"], ["Inner door", stage === "open"]] as const).map(([l, ok]) => (
              <li key={l} className={cn("flex items-center gap-2", ok ? "text-[hsl(var(--lock-glow))]" : "text-[hsl(var(--hull-deep))]/45")}>
                {ok ? <Check className="size-3.5" /> : <span className="size-2 rounded-full border-2 border-current" />} {l} {ok ? "cycled" : "pending"}
              </li>
            ))}
          </ul>
        </div>

        {/* the lock itself */}
        <div className="relative mx-auto aspect-square w-full max-w-[440px]">
          {/* caution frame */}
          <span aria-hidden className="absolute inset-0 rounded-2xl" style={{ background: STRIPES }} />
          <span aria-hidden className="absolute inset-[7px] rounded-xl bg-[hsl(var(--hull-deep))]" />
          {/* pressure gauge */}
          <div aria-hidden className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/50 px-3 py-1 font-mono text-[9px] font-black tracking-[0.2em] text-[hsl(var(--airlock-ink))] ring-1 ring-white/15">
            <AlertTriangle className={cn("size-3", stage !== "idle" ? "text-[hsl(var(--warn))]" : "text-white/30")} />
            {stage === "idle" ? "CHAMBER — SEALED OUTER" : stage === "sealed" ? "EQUALIZING PRESSURE" : "GREEN — INNER CYCLE"}
          </div>

          {/* outer iris (code step) */}
          <AnimatePresence>
            {stage === "idle" && (
              <motion.form onSubmit={submit} initial={{ opacity: 0 }} exit={reduce ? { opacity: 0 } : { scale: 0.86, opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-[22px] z-10 flex flex-col items-center justify-center gap-5 rounded-lg bg-[hsl(var(--hull))] p-6">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[hsl(var(--hull-deep))]">Enter access code</p>
                <div className="flex gap-2" role="group" aria-label={`Access code, ${codeLength} characters`}>
                  {Array.from({ length: codeLength }, (_, i) => (
                    <input
                      key={i}
                      inputMode="numeric"
                      maxLength={1}
                      aria-label={`Character ${i + 1}`}
                      value={code[i] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 1)
                        setCode((c) => c.slice(0, i) + v + c.slice(i + 1))
                        if (v) ((e.target.parentElement?.children[i + 1] as HTMLInputElement) ?? e.target)?.focus?.()
                      }}
                      onKeyDown={(e) => { if (e.key === "Backspace" && !code[i]) { const p = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement; p?.focus(); setCode((c) => c.slice(0, -1)) } }}
                      className={cn("h-14 w-11 rounded-md border-2 bg-[hsl(var(--hull-deep))] text-center font-mono text-2xl font-black text-[hsl(var(--airlock-ink))] outline-none transition-colors", error ? "border-[hsl(var(--warn))] animate-pulse" : "border-white/20 focus:border-[hsl(var(--warn))]", code[i] && "border-[hsl(var(--warn))]/70")}
                    />
                  ))}
                </div>
                <button type="submit" disabled={busy || code.length < codeLength} className="inline-flex h-11 items-center gap-2 rounded-full bg-[hsl(var(--warn))] px-6 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-black disabled:opacity-40">
                  <KeyRound className="size-4" /> {busy ? "cycling…" : "cycle outer door"}
                </button>
                {error && <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-500">code rejected — chamber holds</p>}
                <p aria-live="polite" className="sr-only">{error ? "Code rejected." : stage}</p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* pressure equalize animation */}
          {stage === "sealed" && (
            <motion.div aria-hidden className="absolute inset-[22px] z-10 overflow-hidden rounded-lg bg-[hsl(var(--hull-deep))]">
              <motion.span animate={reduce ? { opacity: [0.4, 1] } : { y: ["110%", "-10%"] }} transition={{ duration: 2.2, ease: "linear" }} className="absolute inset-x-0 h-[45%] bg-gradient-to-t from-[hsl(var(--warn)/0.5)] via-[hsl(var(--lock-glow)/0.35)] to-transparent" />
              <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 grid place-items-center font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/80">pressurizing…</motion.p>
            </motion.div>
          )}

          {/* inner doors: part to reveal the panel */}
          <div className={cn("absolute inset-[22px] overflow-hidden rounded-lg transition-all", stage === "open" ? "visible" : "invisible")}>
            <div className="absolute inset-0 bg-[hsl(var(--hull))] p-6">
              {innerPanel ?? children ?? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Check className="size-8 text-[hsl(var(--lock-glow))]" />
                  <p className="mt-3 font-display text-xl font-black text-[hsl(var(--hull-deep))]">Welcome aboard.</p>
                  <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--hull-deep))]/60">Drop your post-auth panel here via <code className="font-mono text-[11px]">innerPanel</code>.</p>
                </div>
              )}
            </div>
            {[0, 1].map((side) => (
              <motion.span
                key={side}
                aria-hidden
                initial={{ x: 0 }}
                animate={stage === "open" ? { x: side ? "102%" : "-102%" } : { x: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.7, 0, 0.2, 1], delay: 0.15 + side * 0.12 }}
                className="absolute inset-y-0 w-1/2 bg-[hsl(var(--hull-deep))]"
                style={{ [side ? "right" : "left"]: 0, boxShadow: "inset 0 0 0 3px hsl(var(--hull) / 0.35)" } as React.CSSProperties}
              >
                <span className="absolute top-1/2 h-8 w-[3px] -translate-y-1/2 rounded" style={{ [side ? "left" : "right"]: 10, background: "hsl(var(--warn))" } as React.CSSProperties} />
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
