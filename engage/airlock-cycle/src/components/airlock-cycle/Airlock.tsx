import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { AlertTriangle, Check, KeyRound, Lock, Loader2 } from "lucide-react"
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
//   A11Y     real form controls, keyboard navigation (arrow/paste/backspace),
//            states mirrored as aria-live, focus-visible rings, reduced-motion
//            falls back to opacity crossfades

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

export function Airlock({
  title = "Two doors. One truth.",
  intro,
  stage: stageProp,
  codeLength = 6,
  onVerify,
  innerPanel,
  children,
  className,
}: AirlockProps) {
  const _reduce = useReducedMotion()
  const reduce = !!_reduce
  const [inner, setInner] = React.useState<AirlockStage>("idle")
  const stage = stageProp ?? inner
  const [code, setCode] = React.useState(() => Array(codeLength).fill(""))
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const timeoutRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  // Keep code array in sync if codeLength changes
  React.useEffect(() => {
    setCode((prev) => {
      const next = Array(codeLength).fill("")
      for (let i = 0; i < Math.min(prev.length, codeLength); i++) next[i] = prev[i]
      return next
    })
  }, [codeLength])

  const codeString = React.useMemo(() => code.join(""), [code])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (codeString.length < codeLength || busy) return
    setBusy(true)
    setError(null)
    try {
      const ok = onVerify ? await onVerify(codeString) : true
      if (ok) {
        setInner("sealed")
        if (!stageProp) {
          timeoutRef.current = window.setTimeout(() => setInner("open"), reduce ? 400 : 2600)
        } else {
          timeoutRef.current = window.setTimeout(() => setInner("open"), reduce ? 400 : 2600)
        }
      } else {
        setError("Code not recognized — chamber holds. Try again.")
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError("Verification failed. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1)
    setCode((prev) => {
      const next = [...prev]
      next[index] = v
      return next
    })
    if (v && index < codeLength - 1) {
      requestAnimationFrame(() => inputRefs.current[index + 1]?.focus())
    }
    if (error) setError(null)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      e.preventDefault()
      setCode((prev) => {
        const next = [...prev]
        next[index - 1] = ""
        return next
      })
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < codeLength - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, codeLength)
    if (!pasted) return
    e.preventDefault()
    const chars = pasted.split("")
    setCode((prev) => {
      const next = [...prev]
      for (let i = 0; i < codeLength; i++) next[i] = chars[i] ?? ""
      return next
    })
    const focusIndex = Math.min(chars.length, codeLength - 1)
    requestAnimationFrame(() => inputRefs.current[focusIndex]?.focus())
    if (error) setError(null)
  }

  const isComplete = codeString.length === codeLength

  return (
    <section
      className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--hull))] px-4 py-16 sm:px-6 sm:py-20 lg:px-8", className)}
      aria-labelledby="airlock-title"
    >
      <div className="mx-auto grid w-full max-w-[1080px] items-center gap-10 lg:grid-cols-[1.05fr_460px]">
        <div>
          <MonoLabel className="text-[hsl(var(--hull-deep))]/80">
            <Lock className="mr-1 inline size-3" aria-hidden /> SECURITY · AIRLOCK PROTOCOL
          </MonoLabel>
          <h2 id="airlock-title" className="mt-3 font-display text-3xl font-black tracking-tight text-[hsl(var(--hull-deep))] sm:text-[40px]">
            {title}
          </h2>
          {intro && <p className="mt-3 max-w-[48ch] text-[15px] font-medium leading-relaxed text-[hsl(var(--hull-deep))]/70">{intro}</p>}
          <ul className="mt-6 space-y-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]" aria-label="Airlock status">
            {(
              [
                ["Outer door", stage !== "idle"],
                ["Pressure seal", stage !== "idle"],
                ["Inner door", stage === "open"],
              ] as const
            ).map(([label, ok]) => (
              <li
                key={label}
                className={cn("flex items-center gap-2.5 rounded-full border px-3 py-1.5", ok ? "border-[hsl(var(--lock-glow))]/30 bg-[hsl(var(--lock-glow))]/10 text-[hsl(var(--lock-glow))]" : "border-[hsl(var(--hull-deep))]/10 text-[hsl(var(--hull-deep))]/50")}
              >
                {ok ? <Check className="size-3.5 shrink-0" aria-hidden /> : <span className="size-2 shrink-0 rounded-full border-2 border-current" aria-hidden />}
                <span>
                  {label} <span className="opacity-70">{ok ? "— cycled" : "— pending"}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* the lock itself */}
        <div className="relative mx-auto aspect-square w-full max-w-[440px] rounded-2xl" role="region" aria-label="Airlock chamber">
          {/* caution frame */}
          <span aria-hidden className="absolute inset-0 rounded-2xl" style={{ background: STRIPES }} />
          <span aria-hidden className="absolute inset-[7px] rounded-xl bg-[hsl(var(--hull-deep))] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]" />
          {/* pressure gauge */}
          <div
            aria-hidden
            className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 font-mono text-[9px] font-black tracking-[0.2em] text-[hsl(var(--airlock-ink))] ring-1 ring-white/15 backdrop-blur"
          >
            <AlertTriangle className={cn("size-3", stage !== "idle" ? "text-[hsl(var(--warn))]" : "text-white/30")} />
            {stage === "idle" ? "CHAMBER — SEALED OUTER" : stage === "sealed" ? "EQUALIZING PRESSURE" : "GREEN — INNER CYCLE"}
          </div>

          {/* outer iris (code step) */}
          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <motion.form
                key="idle"
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { scale: 0.96, opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-[22px] z-10 flex flex-col items-center justify-center gap-5 rounded-xl bg-[hsl(var(--hull))] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
                aria-label="Access code entry"
              >
                <div className="text-center">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[hsl(var(--hull-deep))]/70">Enter access code</p>
                  <p className="mt-1 font-mono text-[10px] leading-none text-[hsl(var(--hull-deep))]/50">{codeLength} digits · paste supported</p>
                </div>

                <div className="flex gap-1.5 sm:gap-2" role="group" aria-label={`Access code, ${codeLength} digits`} onPaste={handlePaste}>
                  {Array.from({ length: codeLength }, (_, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      aria-label={`Digit ${i + 1} of ${codeLength}`}
                      value={code[i] ?? ""}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onFocus={(e) => e.target.select()}
                      className={cn(
                        "h-12 w-9 rounded-lg border-2 bg-[hsl(var(--hull-deep))] text-center font-mono text-xl font-black tracking-widest text-[hsl(var(--airlock-ink))] shadow-inner outline-none transition-all sm:h-14 sm:w-11 sm:text-2xl",
                        "placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-[hsl(var(--warn))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--hull-deep))]",
                        error
                          ? "border-[hsl(var(--warn))] focus-visible:ring-[hsl(var(--warn))]"
                          : "border-white/15 focus:border-[hsl(var(--warn))]",
                        code[i] && !error && "border-[hsl(var(--warn))]/60 bg-[hsl(var(--hull-deep))]",
                      )}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={busy || !isComplete}
                  aria-busy={busy}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[hsl(var(--warn))] px-6 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-sm transition-all hover:bg-[hsl(var(--warn))]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--warn))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--hull))] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
                  {busy ? "Cycling…" : "Cycle outer door"}
                </button>

                <div className="min-h-[20px] text-center">
                  {error ? (
                    <p role="alert" className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-red-600 ring-1 ring-red-500/20">
                      <AlertTriangle className="size-3" aria-hidden />
                      {error}
                    </p>
                  ) : (
                    <p className="font-mono text-[10px] font-medium text-[hsl(var(--hull-deep))]/40">Demo accepts any {codeLength}-digit code</p>
                  )}
                </div>
                <p aria-live="polite" className="sr-only">
                  {error ? error : `Stage: ${stage}. ${isComplete ? "Code complete, ready to cycle." : `${codeString.length} of ${codeLength} digits entered.`}`}
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* pressure equalize animation */}
          {stage === "sealed" && (
            <motion.div
              aria-hidden
              className="absolute inset-[22px] z-10 overflow-hidden rounded-xl bg-[hsl(var(--hull-deep))]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.4 }}
            >
              <motion.span
                animate={reduce ? { opacity: [0.45, 1] } : { y: ["110%", "-10%"] }}
                transition={reduce ? { duration: 1.2, repeat: Infinity, repeatType: "reverse" } : { duration: 2.2, ease: "linear", repeat: Infinity }}
                className="absolute inset-x-0 h-[45%] bg-gradient-to-t from-[hsl(var(--warn)/0.55)] via-[hsl(var(--lock-glow)/0.35)] to-transparent"
              />
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 grid place-items-center font-mono text-[10px] font-black uppercase tracking-[0.32em] text-white/90"
              >
                Pressurizing… {reduce ? "" : "— HOLD"}
              </motion.p>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold uppercase tracking-widest text-white/50">
                Inner door unlocks in {reduce ? "a moment" : "2.6s"}
              </span>
            </motion.div>
          )}

          {/* inner doors: part to reveal the panel */}
          <div className={cn("absolute inset-[22px] overflow-hidden rounded-xl", stage === "open" ? "visible" : "invisible")} aria-hidden={stage !== "open"}>
            <div className="absolute inset-0 overflow-auto bg-[hsl(var(--hull))] p-6">
              {innerPanel ?? children ?? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="grid size-12 place-items-center rounded-full bg-[hsl(var(--lock-glow))]/15 ring-1 ring-[hsl(var(--lock-glow))]/20">
                    <Check className="size-7 text-[hsl(var(--lock-glow))]" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-xl font-black tracking-tight text-[hsl(var(--hull-deep))]">Welcome aboard.</p>
                  <p className="mt-1.5 max-w-[28ch] text-[13px] font-medium leading-relaxed text-[hsl(var(--hull-deep))]/60">
                    Chamber is green. Drop your post-auth panel via <code className="rounded bg-[hsl(var(--hull-deep))]/5 px-1 py-0.5 font-mono text-[11px]">innerPanel</code>.
                  </p>
                </div>
              )}
            </div>
            {[0, 1].map((side) => (
              <motion.span
                key={side}
                aria-hidden
                initial={{ x: 0 }}
                animate={stage === "open" ? { x: side ? "102%" : "-102%" } : { x: 0 }}
                transition={reduce ? { duration: 0.22, ease: "easeOut" } : { duration: 0.9, ease: [0.7, 0, 0.2, 1], delay: 0.15 + side * 0.12 }}
                className="absolute inset-y-0 w-1/2 bg-[hsl(var(--hull-deep))]"
                style={{ [side ? "right" : "left"]: 0, boxShadow: "inset 0 0 0 1px hsl(var(--hull) / 0.35)" } as React.CSSProperties}
              >
                <span
                  className="absolute top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full"
                  style={{ [side ? "left" : "right"]: 10, background: "hsl(var(--warn))" } as React.CSSProperties}
                />
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
