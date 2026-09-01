import * as React from "react"
import { motion } from "motion/react"
import { Check, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

export type SkillNode = { id: string; label: string; state: "done" | "available" | "locked"; description?: string }
export type SkillTreeRailProps = {
  nodes?: SkillNode[]
  className?: string
  onUnlock?: (id: string) => void
}

const DEFAULT_NODES: SkillNode[] = [
  { id: "s1", label: "HTML bones", state: "done", description: "Semantic foundations" },
  { id: "s2", label: "CSS muscles", state: "done", description: "Layout & typography" },
  { id: "s3", label: "JS nerves", state: "available", description: "Interactivity" },
  { id: "s4", label: "Motion sense", state: "locked", description: "Animation" },
  { id: "s5", label: "Systems brain", state: "locked", description: "Architecture" },
  { id: "s6", label: "Taste", state: "locked", description: "Judgment" },
]

export function SkillTreeRail({ nodes = DEFAULT_NODES, className, onUnlock }: SkillTreeRailProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [local, setLocal] = React.useState(nodes)

  React.useEffect(() => setLocal(nodes), [nodes])

  const complete = (n: SkillNode) => {
    if (n.state === "locked") return
    if (n.state === "done") return
    const idx = local.findIndex((x) => x.id === n.id)
    const next = local.map((x, i) => {
      if (x.id === n.id) return { ...x, state: "done" as const }
      if (i === idx + 1 && x.state === "locked") return { ...x, state: "available" as const }
      return x
    })
    setLocal(next)
    onUnlock?.(n.id)
  }

  const doneCount = local.filter((n) => n.state === "done").length

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", cn(className))}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-14 sm:py-16")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />SKILL TREE · PROGRESSION</span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Build in order. Earn the next.</h2>
        </div>
        <span className="font-mono text-[11px] font-medium text-muted-foreground">
          {doneCount} / {local.length} completed
        </span>
      </div>

      <div className="mt-8 overflow-x-auto pb-4" tabIndex={0} aria-label="Skill progression, scrollable">
        <div className="flex min-w-max items-start gap-0">
          {local.map((n, i) => {
            const prevDone = i === 0 || local[i - 1]!.state === "done"
            const isLocked = n.state === "locked"
            return (
              <React.Fragment key={n.id}>
                <InView once delay={i * 0.05} className="shrink-0">
                  <Button
                    variant="ghost"
                    disabled={isLocked}
                    onClick={() => complete(n)}
                    aria-label={`${n.label}: ${n.state}${n.description ? ` — ${n.description}` : ""}`}
                    aria-disabled={isLocked}
                    className="group h-auto w-28 flex-col gap-3 rounded-xl p-0 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className={cn(
                        "relative grid size-14 place-items-center rounded-xl border bg-card shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        n.state === "done" && "border-foreground bg-foreground text-background",
                        n.state === "available" && "border-foreground bg-background text-foreground hover:bg-muted/50",
                        n.state === "locked" && "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {n.state === "locked" ? (
                        <Lock className="size-4" aria-hidden />
                      ) : n.state === "done" ? (
                        <Check className="size-5" aria-hidden />
                      ) : (
                        <span className="font-mono text-xs font-bold">{String(i + 1).padStart(2, "0")}</span>
                      )}
                    </span>
                    <span className="flex flex-col items-center">
                      <span
                        className={cn(
                          "font-mono text-[11px] font-semibold uppercase leading-tight tracking-[0.08em]",
                          n.state === "locked" ? "text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {n.label}
                      </span>
                      {n.description && <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{n.description}</span>}
                    </span>
                    {n.state === "available" && <span className="rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-background">Start</span>}
                  </Button>
                </InView>

                {i < local.length - 1 && (
                  <span aria-hidden className="mx-1 mt-7 h-px w-12 shrink-0 bg-border sm:w-16">
                    <motion.span
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: prevDone ? 1 : 0 }}
                      viewport={{ once: true }}
                      transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: "left" }}
                      className={cn("block h-full", prevDone ? "bg-foreground" : "bg-transparent")}
                    />
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <p className="font-mono text-[11px] font-medium text-muted-foreground">Complete an available skill to unlock the next. No skipping — that’s the point.</p>
    
  </div>
</section>
  )
}
