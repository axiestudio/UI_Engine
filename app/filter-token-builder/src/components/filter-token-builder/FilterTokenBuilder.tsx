import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — Power-Query-as-tokens. Typed filters, readable to anyone.
// JOB      build "segment=bio AND status≠done AND city: Jönköping" with keys
// SIGNATURE type `field op value` → it SNAPS into a coloured token above;
//           the AND/OR operator between chips is a real toggle (click it);
//           backspace at empty pops the last token back into the text as raw.
// A11Y     tokens are removable buttons; operator toggle exposes the logic
//          read-out text.

export type FilterToken = { field: string; op: "=" | "≠" | ":"; value: string }
export type FilterTokenBuilderProps = { tokens: FilterToken[]; onChange: (t: FilterToken[]) => void; and: boolean; onAnd: (v: boolean) => void; fields?: string[]; placeholder?: string; className?: string }
const PALETTE = ["hsl(var(--info))", "hsl(var(--pinned))", "hsl(var(--ok))", "hsl(var(--warn))"]

export function FilterTokenBuilder({ tokens, onChange, and, onAnd, fields = [], placeholder = "field=value, type ⇥ to autocomplete", className }: FilterTokenBuilderProps) {
  const [text, setText] = React.useState("")
  const commit = (raw?: string) => {
    const m = (raw ?? text).trim().match(/^([\w.-]+)\s*(=|≠|!=|:)\s*(.+)$/)
    if (!m) return
    const op = m[2] === "!=" ? "≠" : m[2]
    onChange([...tokens, { field: m[1].toLowerCase(), op: op as FilterToken["op"], value: m[3] }])
    setText("")
  }
  return (
    <div className={cn("rounded-lg border bg-background p-2.5 font-sans", className)}>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5">
        <Filter aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        {tokens.map((t, i) => {
          const col = PALETTE[i % PALETTE.length]
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <button onClick={() => onAnd(!and)} aria-label={and ? "Change operator to OR" : "Change operator to AND"} className="rounded px-1 text-xs font-semibold text-muted-foreground">
                  <motion.span key={String(and)} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">{and ? "AND" : "OR"}</motion.span>
                </button>
              )}
              <motion.span layout initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} className="group flex items-center gap-1.5 py-1 pl-2.5 pr-1 text-[12px] font-medium shadow-sm" style={{ background: `color-mix(in srgb, ${col} 13%, white)`, color: col, borderRadius: 999, outline: `1px solid color-mix(in srgb, ${col} 32%, transparent)` }}>
                {t.field}<span className="font-mono">{t.op}</span>“{t.value}”
                <button aria-label={`Remove filter ${t.field} ${t.op} ${t.value}`} onClick={() => onChange(tokens.filter((_, x) => x !== i))} className="grid size-4 place-items-center rounded-full bg-black/10"><X className="size-2.5" /></button>
              </motion.span>
            </React.Fragment>
          )
        })}
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === "," ) { e.preventDefault(); commit() } else if (e.key === "Backspace" && !text && tokens.length) { const last = tokens[tokens.length - 1]; setText(`${last.field}${last.op === "≠" ? "!=" : last.op}${last.value}`); onChange(tokens.slice(0, -1)) } }} placeholder={placeholder} className="h-8 min-w-[160px] flex-1 bg-transparent px-1 text-[13px] outline-none" aria-label="Add filter" list={fields.length ? "filter-fields" : undefined} aria-describedby="filter-readout" />
      </div>
      {fields.length > 0 && <datalist id="filter-fields">{fields.map((f) => <option key={f} value={f + "="} />)}</datalist>}
      <p id="filter-readout" className="mt-1.5 truncate text-xs text-muted-foreground">{tokens.length ? tokens.map((t) => `${t.field}${t.op}${t.value}`).join(and ? " and " : " or ") : "no filters — showing everything"}</p>
    </div>
  )
}
