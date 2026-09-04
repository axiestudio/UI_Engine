import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Check, Copy, WrapText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — docs and devtools ship code; code ships with manners.
// JOB      show a snippet you trust and can actually use
// SIGNATURE language auto-detected as a chip; the copy button morphs into a
//           ✓ that REWRITES the label ("copied"); hovering a line lights its
//           gutter number; wrap toggles with a smooth line-height swap.
// A11Y     code element with label; copy announced by live region.

export type CodeSnippetPanelProps = { code: string; language?: string; title?: string; copyText?: string; className?: string }

const detect = (c: string) => {
  if (/^\s*(<\w|<!doctype)/i.test(c)) return "html"
  if (/\bfn main\b|\blet mut\b/.test(c)) return "rust"
  if (/=>|const |function |\bimport\b/.test(c)) return "ts/js"
  if (/\bdef \w+\(|import \w+\n/.test(c)) return "python"
  if (/^\s*[\w-]+:\s/.test(c)) return "yaml"
  return "text"
}

export function CodeSnippetPanel({ code, language, title, copyText, className }: CodeSnippetPanelProps) {
  const [copied, setCopied] = React.useState(false)
  const [wrap, setWrap] = React.useState(false)
  const lang = language ?? detect(code)
  const lines = code.replace(/\n$/, "").split("\n")
  const copy = async () => { try { await navigator.clipboard.writeText(copyText ?? code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {} }
  return (
    <figure className={cn("relative isolate overflow-hidden rounded-xl border border-border/70 bg-card font-sans", className)}>
      <MotionConfig reducedMotion="user">
      <figcaption className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-1.5">
        {title && <span className="truncate text-sm font-medium">{title}</span>}
        <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[11px] font-medium text-accent-foreground">{lang}</span>
        <span className="ml-auto flex items-center gap-0.5">
          <Button type="button" variant="ghost" aria-pressed={wrap} aria-label="Toggle line wrap" onClick={() => setWrap((w) => !w)} className={cn("grid size-9 place-items-center rounded text-muted-foreground hover:bg-muted", wrap && "bg-accent")}><WrapText className="size-3.5" /></Button>
          <Button type="button" variant="ghost" onClick={copy} className="flex h-9 items-center gap-1.5 rounded px-2 text-xs font-medium text-muted-foreground hover:bg-muted">
            <AnimatePresence mode="wait" initial={false}>
              {copied ? <motion.span key="c" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="flex items-center gap-1.5 text-[hsl(var(--ok))]"><Check className="size-3.5" /> copied</motion.span> : <motion.span key="p" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5"><Copy className="size-3.5" /> copy</motion.span>}
            </AnimatePresence>
          </Button>
        </span>
      </figcaption>
      <pre className={cn("overflow-x-auto p-0 text-[12.5px]", !wrap && "overflow-x-auto")} >
        <code className="block py-2 font-mono leading-[1.9]">
          {lines.map((l, i) => (
            <span key={i} className={cn("group flex px-3", wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre")}>
              <span aria-hidden className="mr-3 w-7 shrink-0 select-none text-right text-[11px] leading-[1.9] text-muted-foreground/50 transition-colors group-hover:text-muted-foreground group-hover:font-semibold">{i + 1}</span>
              {l || " "}
            </span>
          ))}
        </code>
      </pre>
      <p className="sr-only" aria-live="polite">{copied ? "Code copied to clipboard." : ""}</p>
          
          </MotionConfig>
    </figure>
  )
}
