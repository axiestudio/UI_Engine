import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { History, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — Figma's history rail, extractable.
// JOB      move through document versions without fear
// SIGNATURE a horizontal scrub rail of version pips; hovering scrubs a GHOST
//           preview (your snapshot render) with a dissolve; releasing commits
//           and a confirm chip springs in with "Restore to 14:22?" — one more
//           click and the timeline itself glides to that point.
// API      versions [{id, at, label, snapshot:ReactNode}], onRestore(id).
// A11Y     slider semantics (value from 0..n-1, home/end), live announce.

export type Version = { id: string; at: string; label: string }
export type UndoHistorySliderProps = { versions: Version[]; head?: string; render: (v: Version) => React.ReactNode; onRestore: (id: string) => void; className?: string }

export function UndoHistorySlider({ versions, head, render, onRestore, className }: UndoHistorySliderProps) {
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null)
  const [pending, setPending] = React.useState<Version | null>(null)
  const idx = hoverIdx ?? versions.length - 1
  return (
    <div className={cn("rounded-xl border bg-card p-4 font-sans", className)}>
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-[hsl(var(--app-code))]">
        {versions.map((v, i) => (
          <div key={v.id} aria-hidden={i !== idx} className={cn("absolute inset-0 transition-opacity duration-200", i === idx ? "opacity-100" : "opacity-0")}>{render(v)}</div>
        ))}
        {hoverIdx !== null && hoverIdx < versions.length - 1 && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-white"><History className="size-3" /> previewing</motion.span>
        )}
      </div>
      <div className="relative mt-5 h-8">
        <span aria-hidden className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-border" />
        <div role="slider" tabIndex={0} aria-label="Version history" aria-valuemin={1} aria-valuemax={versions.length} aria-valuenow={idx + 1} aria-valuetext={`${versions[idx]?.label} — ${versions[idx]?.at}`}
          onKeyDown={(e) => { if (e.key === "Home") { setHoverIdx(0); setPending(versions[0]) } if (e.key === "End") { setHoverIdx(null); setPending(null) } if (e.key === "ArrowLeft") { const n = Math.max(0, idx - 1); setHoverIdx(n); setPending(versions[n]) } if (e.key === "ArrowRight") { const n = Math.min(versions.length - 1, idx + 1); n === versions.length - 1 ? (setHoverIdx(null), setPending(null)) : (setHoverIdx(n), setPending(versions[n])) } }}
          className="absolute inset-x-0 top-0 grid h-full place-items-center outline-none">
          <ul className="flex w-full items-center justify-between px-2">
            {versions.map((v, i) => (
              <li key={v.id}>
                <button aria-label={`Preview ${v.label}`} onMouseEnter={() => { setHoverIdx(i); i < versions.length - 1 && setPending(v) }} onMouseLeave={() => hoverIdx !== null && setHoverIdx(null)} className="group grid size-6 place-items-center">
                  <motion.span animate={{ scale: i === idx ? 1.5 : 1, background: i === idx ? "hsl(var(--app-focus))" : "hsl(var(--muted-foreground))" }} transition={{ type: "spring", stiffness: 400, damping: 24 }} className="block size-1.5 rounded-full ring-4 ring-card" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{head ?? "history"} · {versions.length} versions</p>
        <AnimatePresence>
          {pending && <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={() => { onRestore(pending.id); setPending(null); setHoverIdx(null) }} className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-primary-foreground"><RotateCcw className="size-3.5" /> restore “{pending.label}”</motion.button>}
        </AnimatePresence>
      </div>
      <p className="sr-only" aria-live="polite">{pending ? `Previewing ${pending.label}. Press restore to apply.` : "At latest version."}</p>
    </div>
  )
}
