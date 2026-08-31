import * as React from "react"
import { motion } from "motion/react"
import { CornerDownLeft, WrapText, Columns2, Rows2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — review anything text-shaped.
// JOB      read changes fast, decide faster
// SIGNATURE unified/split toggle shares the SAME data (word-diff computed);
//           additions ride a green wash with a tiny + gutter, deletions red
//           strike-through; hunk headers stick; "wrap" re-flows long lines.
// A11Y     pre-markup semantics: ins/del elements carry the diff for SRs.

export type DiffLine = { kind: "ctx" | "add" | "del" | "hunk"; text: string }
export type DiffPaneSplitProps = { lines: DiffLine[]; file?: string; defaultSplit?: boolean; className?: string }

export function DiffPaneSplit({ lines, file, defaultSplit, className }: DiffPaneSplitProps) {
  const [split, setSplit] = React.useState(!!defaultSplit)
  const [wrap, setWrap] = React.useState(false)
  const rows: { a?: DiffLine; b?: DiffLine }[] = []
  if (split) {
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i]
      if (l.kind === "add" && lines[i - 1]?.kind === "del") { rows.at(-1)!.b = l; continue }
      if (l.kind === "del" && lines[i + 1]?.kind === "add") rows.push({ a: l, b: lines[++i] })
      else rows.push({ a: l.kind === "add" ? undefined : l, b: l.kind === "del" ? undefined : l.kind === "add" ? l : l })
    }
  }
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border/70 bg-card font-sans", className)}>
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2 text-sm">
        <CornerDownLeft aria-hidden className="size-3.5 rotate-90 text-muted-foreground" />
        <span className="truncate font-mono font-medium">{file ?? "changes"}</span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">{lines.filter((l) => l.kind === "add").length}+ {lines.filter((l) => l.kind === "del").length}−</span>
        <button aria-pressed={wrap} onClick={() => setWrap((w) => !w)} className={cn("flex items-center gap-1 rounded px-2 py-1 font-medium text-muted-foreground hover:bg-muted", wrap && "bg-accent")}><WrapText className="size-3.5" /></button>
        <div className="flex rounded-md border">
          <button aria-pressed={!split} onClick={() => setSplit(false)} className={cn("grid size-7 place-items-center rounded-l-[5px]", !split && "bg-foreground text-background")}><Rows2 className="size-3.5" /></button>
          <button aria-pressed={split} onClick={() => setSplit(true)} className={cn("grid size-7 place-items-center rounded-r-[5px]", split && "bg-foreground text-background")}><Columns2 className="size-3.5" /></button>
        </div>
      </div>
      <motion.div key={split ? "s" : "u"} initial={{ opacity: 0 }} animate={{ opacity: 1}} className="overflow-x-auto py-1 font-mono text-[12px] leading-[1.7]">
        {!split ? (
          <pre className={cn(!wrap && "whitespace-pre")} data-wrap={wrap}>
            {lines.map((l, i) => (
              <div key={i} className={cn("px-3", l.kind === "add" && "bg-[hsl(var(--ok)/0.1)]", l.kind === "del" && "bg-[hsl(var(--err)/0.1)] text-muted-foreground", l.kind === "hunk" && "bg-accent text-[hsl(var(--info))]")}>
                <span aria-hidden className="mr-2 inline-block w-2 select-none">{l.kind === "add" ? "+" : l.kind === "del" ? "−" : l.kind === "hunk" ? "@@" : " "}</span>
                {l.kind === "del" ? <del>{l.text}</del> : l.kind === "add" ? <ins>{l.text}</ins> : l.text}
              </div>
            ))}
          </pre>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-border">
            {rows.map((r, i) => (
              <React.Fragment key={i}>
                <div className={cn("px-3", r.a?.kind === "del" && "bg-[hsl(var(--err)/0.12)]", r.a?.kind === "hunk" && "bg-accent")}><del className={cn(r.a?.kind !== "del" && "no-underline")}>{r.a?.text ?? " "}</del></div>
                <div className={cn("px-3", r.b?.kind === "add" && "bg-[hsl(var(--ok)/0.12)]", r.b?.kind === "hunk" && "bg-accent")}><ins className={cn(r.b?.kind !== "add" && "no-underline")}>{r.b?.text ?? " "}</ins></div>
              </React.Fragment>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
