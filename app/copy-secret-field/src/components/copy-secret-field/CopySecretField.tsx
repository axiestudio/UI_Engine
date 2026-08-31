import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Check, Copy, Eye, EyeOff, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — API keys deserve ceremony.
// JOB      let a user read, copy, and rotate a secret safely
// SIGNATURE masking is a CHARACTER MORPH: on reveal, dots unmask left→right
//           (stagger ~18ms/char) like a cheap magic trick that reads as
//           premium; the copy button becomes a green ✓ for 1.6s; rotate spins
//           the whole field through a blurred "issuing…" swap.
// A11Y     revealed value lives in the real input only while shown; copy
//          announces via live region.

export type CopySecretFieldProps = { value: string; onRotate?: () => void; rotating?: boolean; label?: string; mono?: boolean; className?: string }

export function CopySecretField({ value, onRotate, rotating, label = "Secret", mono = true, className }: CopySecretFieldProps) {
  const [show, setShow] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const copy = async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch {} }
  const chars = show ? value.split("") : value.split("").map(() => "•")

  return (
    <div className={cn("font-sans", className)}>
      {label && <span className="mb-1 block text-sm font-medium text-muted-foreground">{label}</span>}
      <div className="relative flex h-10 items-center overflow-hidden rounded-lg border border-border/70 bg-background pr-[104px]">
        <motion.div aria-hidden initial={false} animate={{ filter: rotating ? "blur(5px)" : "blur(0)" }} transition={{ duration: 0.25 }} className={cn("flex-1 overflow-x-auto whitespace-nowrap px-3 text-[13px]", mono && "font-mono")}>
          {value.split("").map((ch, i) => (
            <motion.span key={i} animate={{ opacity: 1 }} initial={false} transition={{ delay: reduce || !show ? 0 : i * 0.016 }} style={{ fontFamily: "inherit" }}>
              {chars[i]}
            </motion.span>
          ))}
        </motion.div>
        <span className="sr-only">{show ? "Visible: " + value : "Hidden: " + value.length + " characters"}</span>
        <div className="absolute right-1.5 flex items-center gap-0.5">
          <span className="w-1" />
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 border-l bg-card px-1.5">
          <button type="button" aria-pressed={show} aria-label={show ? "Hide value" : "Reveal value"} onClick={() => setShow((s) => !s)} className="grid size-7 place-items-center rounded hover:bg-muted">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
          <button type="button" onClick={copy} aria-label="Copy to clipboard" className="grid size-7 place-items-center rounded hover:bg-muted">
            <AnimatePresence mode="wait" initial={false}>
              {copied ? <motion.span key="ok" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}><Check className="size-4 text-[hsl(var(--ok))]" /></motion.span> : <motion.span key="cp" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}><Copy className="size-4" /></motion.span>}
            </AnimatePresence>
          </button>
          {onRotate && <button type="button" onClick={onRotate} aria-label="Rotate secret" disabled={rotating} className="grid size-7 place-items-center rounded hover:bg-muted disabled:opacity-60"><motion.span animate={rotating ? { rotate: 360 } : { rotate: 0 }} transition={rotating ? { repeat: Infinity, duration: 0.9, ease: "linear" } : { duration: 0.3 }}><RotateCw className="size-4" /></motion.span></button>}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">{copied ? "Copied to clipboard." : ""}</p>
    </div>
  )
}
