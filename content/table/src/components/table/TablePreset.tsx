import * as React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type TableColumn = {
  key: string
  label: string
  align?: "left" | "right" | "center"
  /** Enable click-to-sort on this column. Default true. */
  sortable?: boolean
  /** Custom comparator (defaults: number asc, else localeCompare). */
  compare?: (a: string | number, b: string | number) => number
  className?: string
}

export type TablePresetProps = {
  eyebrow?: string
  title?: string
  description?: string
  columns: TableColumn[]
  rows: Record<string, string | number>[]
  caption?: string
  /** Zebra striping + row hover. Default true. */
  striped?: boolean
  /** Compact row padding — good for long menus. Default true. */
  dense?: boolean
  defaultSort?: { key: string; dir: "asc" | "desc" }
  /** Small note under the table — pass your own legal/local copy, or omit entirely. */
  footnote?: string
  className?: string
}

// ── TablePreset ──────────────────────────────────────────────────────────────

type Sort = { key: string; dir: "asc" | "desc" } | null

function sortRows(rows: Record<string, string | number>[], key: string, dir: "asc" | "desc"): Record<string, string | number>[] {
  return [...rows].sort((a, b) => {
    const av = a[key], bv = b[key]
    let r: number
    if (typeof av === "number" && typeof bv === "number") r = av - bv
    else r = String(av ?? "").localeCompare(String(bv ?? ""))
    return dir === "asc" ? r : -r
  })
}

export function TablePreset({
  eyebrow,
  title,
  description,
  columns,
  rows,
  caption,
  striped = true,
  dense = true,
  defaultSort,
  footnote,
  className,
}: TablePresetProps) {
  const [sort, setSort] = React.useState<Sort>(defaultSort ?? null)
  const data = React.useMemo<Record<string, string | number>[]>(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (col?.compare) {
      return [...rows].sort((a, b) => col.compare!(a[sort.key], b[sort.key]) * (sort.dir === "asc" ? 1 : -1))
    }
    return sortRows(rows, sort.key, sort.dir)
  }, [rows, sort, columns])

  const toggle = (key: string) =>
    setSort((cur) => (cur?.key === key ? (cur.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" }))

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[900px] px-4 py-16 sm:px-6">
          {(eyebrow || title) && (
            <header className="mb-8">
              {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
              {title && <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
              {description && <p className="mt-2 max-w-prose text-sm font-medium leading-relaxed text-muted-foreground">{description}</p>}
            </header>
          )}

          <div className="overflow-x-auto rounded-[20px] border bg-card shadow-sm">
            <Table>
              {caption && <caption className="px-4 pt-4 text-left text-[11px] font-medium text-muted-foreground">{caption}</caption>}
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {columns.map((col) => {
                    const isSorted = sort?.key === col.key
                    const sortable = col.sortable !== false
                    return (
                      <TableHead
                        key={col.key}
                        aria-sort={isSorted ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                        className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", col.align === "right" && "text-right", col.align === "center" && "text-center", col.className)}
                      >
                        {sortable ? (
                          <button type="button" onClick={() => toggle(col.key)} className={cn("group inline-flex items-center gap-1 uppercase tracking-widest", col.align === "right" && "flex-row-reverse")}>
                            {col.label}
                            <span className={cn("transition-opacity", isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-40")}>
                              {isSorted && sort!.dir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                            </span>
                          </button>
                        ) : (
                          col.label
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, ri) => (
                  <TableRow key={ri} className={cn(striped && ri % 2 === 1 && "bg-muted/30", "hover:bg-accent/50")}>
                    {columns.map((col, ci) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          dense && "py-2",
                          col.align === "right" && "text-right font-mono font-bold tabular-nums",
                          col.align === "center" && "text-center",
                          ci === 0 && "font-bold tracking-tight"
                        )}
                      >
                        {String(row[col.key] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {(footnote || sort) && (
            <p className="mt-3 flex flex-wrap items-center gap-x-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {footnote && <span>{footnote}</span>}
              <span>{data.length} items</span>
              {sort && <span>sorted by {columns.find((col) => col.key === sort.key)?.label ?? sort.key} · {sort.dir}</span>}
            </p>
          )}
        </div>
      </InView>
    </section>
  )
}
