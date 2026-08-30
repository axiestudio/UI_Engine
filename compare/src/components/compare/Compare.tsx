import * as React from "react"
import { Check, Minus, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type CompareCell = boolean | string

export type CompareFeature = {
  feature: string
  values: CompareCell[]
}

export type CompareProduct = {
  name: string
  /** Highlighted column (usually your product). Only one should be highlighted. */
  highlight?: boolean
  note?: string
  cta?: { label: string; href?: string; onClick?: () => void }
}

export type CompareProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  products: CompareProduct[]
  features: CompareFeature[]
  tone?: "paper" | "ink"
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function CellValue({ value, ink }: { value: CompareCell; ink: boolean }) {
  if (value === true) {
    return (
      <span
        className={cn("inline-flex size-6 items-center justify-center rounded-full", ink ? "bg-background text-foreground" : "bg-foreground text-background")}
        aria-label="Included"
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    )
  }
  if (value === false) {
    return (
      <span className={cn("inline-flex size-6 items-center justify-center rounded-full border", ink ? "border-background/20 text-background/35" : "border-border text-muted-foreground/50")} aria-label="Not included">
        <X className="size-3.5" strokeWidth={2.5} />
      </span>
    )
  }
  if (value === "partial") {
    return (
      <span className={cn("inline-flex size-6 items-center justify-center rounded-full border", ink ? "border-background/30 text-background/70" : "border-border text-muted-foreground")} aria-label="Partially included">
        <Minus className="size-3.5" strokeWidth={3} />
      </span>
    )
  }
  return <span className={cn("text-sm font-semibold", ink ? "text-background" : "text-foreground")}>{value}</span>
}

// ── Compare ──────────────────────────────────────────────────────────────────

export function Compare({
  eyebrow,
  title = "Why switch",
  subtitle = "A plain look at what you get here that you don't get there.",
  products,
  features,
  tone = "paper",
  className,
}: CompareProps) {
  if (products.length < 2 || !features.length) return null
  const ink = tone === "ink"
  const highlightIndex = Math.max(0, products.findIndex((p) => p.highlight))

  return (
    <section className={cn(ink && "bg-foreground", "w-full", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {(eyebrow || title || subtitle) && (
          <header className="mb-10 max-w-2xl sm:mb-14">
            {eyebrow && (
              <Badge
                variant="outline"
                className={cn(
                  "mb-4 rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest",
                  ink ? "border-background/25 bg-transparent text-background/80" : "bg-secondary text-muted-foreground",
                )}
              >
                {eyebrow}
              </Badge>
            )}
            {title && (
              <h2 className={cn("font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl", ink ? "text-background" : "text-foreground")}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
                {subtitle}
              </p>
            )}
          </header>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className={cn("overflow-hidden rounded-[24px]", ink ? "border border-background/15" : "border bg-card shadow-sm")}>
            <div className="overflow-x-auto">
              <Table className={cn(ink && "[&_th]:text-background [&_td]:text-background")}>
                <TableHeader>
                  <TableRow className={cn("hover:bg-transparent", ink ? "border-background/10" : "border-border")}>
                    <TableHead className={cn("w-[38%] min-w-44 py-5 text-left", ink ? "text-background/50" : "text-muted-foreground")}>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-widest">Compare</span>
                    </TableHead>
                    {products.map((p, i) => (
                      <TableHead
                        key={p.name}
                        className={cn(
                          "min-w-36 py-5 text-center",
                          i === highlightIndex && (ink ? "bg-background/10" : "bg-secondary/70"),
                          ink ? "text-background/50" : "text-muted-foreground",
                        )}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={cn("font-display text-base font-extrabold tracking-tight", ink ? "text-background" : "text-foreground")}>
                            {p.name}
                          </span>
                          {p.highlight && (
                            <Badge className={cn("rounded-full px-2.5 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "bg-background text-foreground" : "bg-foreground text-background")}>
                              This product
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((row, ri) => (
                    <TableRow
                      key={row.feature}
                      className={cn(ink ? "border-background/10" : "border-border")}
                      style={undefined}
                      data-row={ri}
                    >
                      <TableCell className={cn("py-4 text-sm font-bold", ink ? "text-background" : "text-foreground")}>
                        {row.feature}
                      </TableCell>
                      {products.map((p, i) => (
                        <TableCell
                          key={p.name}
                          className={cn(
                            "py-4 text-center",
                            i === highlightIndex && (ink ? "bg-background/10" : "bg-secondary/70"),
                          )}
                        >
                          <div className="flex justify-center">
                            <CellValue value={row.values[i] ?? false} ink={ink} />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow className={cn("hover:bg-transparent", ink ? "border-background/10" : "border-border")}>
                    <TableCell className="py-6" />
                    {products.map((p, i) => (
                      <TableCell key={p.name} className={cn("py-6 text-center", i === highlightIndex && (ink ? "bg-background/10" : "bg-secondary/70"))}>
                        {p.cta && (
                          <Button
                            size="sm"
                            variant={i === highlightIndex ? "default" : "outline"}
                            className={cn(i === highlightIndex && ink && "bg-background text-foreground hover:bg-background/90", i !== highlightIndex && ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
                            onClick={p.cta.onClick}
                            asChild={Boolean(p.cta.href)}
                          >
                            {p.cta.href ? <a href={p.cta.href}>{p.cta.label}</a> : <span>{p.cta.label}</span>}
                          </Button>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}
