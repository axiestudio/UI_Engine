import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, ChevronDown, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

export type Lesson = { title: string; minutes: number; state: "done" | "open" | "locked" }
export type Module = { title: string; note: string; lessons: Lesson[] }

export type CurriculumRailProps = {
  modules?: Module[]
  className?: string
  onLessonClick?: (m: number, l: number) => void
}

const DEFAULT_MODULES: Module[] = [
  { title: "Foundations", note: "What finishing feels like", lessons: [
    { title: "Scope without guilt", minutes: 12, state: "done" },
    { title: "The two-list method", minutes: 18, state: "done" },
    { title: "Definition of done", minutes: 14, state: "open" },
  ]},
  { title: "Momentum", note: "Shipping as a habit", lessons: [
    { title: "Daily closable units", minutes: 16, state: "open" },
    { title: "The Friday demo", minutes: 22, state: "locked" },
  ]},
  { title: "Craft", note: "Details that compound", lessons: [
    { title: "Edge polish order", minutes: 15, state: "locked" },
    { title: "Performance as design", minutes: 20, state: "locked" },
    { title: "Final: ship one real thing", minutes: 45, state: "locked" },
  ]},
]

export function CurriculumRail({ modules = DEFAULT_MODULES, className, onLessonClick }: CurriculumRailProps) {
  const [openMod, setOpenMod] = React.useState<number>(0)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />CURRICULUM · THE PATH</span>
      <h2 className="mt-2 max-w-[18ch] font-display text-[30px] font-bold leading-[0.98] tracking-tight text-foreground sm:text-[36px]">
        A path you can actually walk.
      </h2>
      <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">Three modules, eight lessons. Start where you left off.</p>

      <div className="relative mt-10">
        {/* rail */}
        <span aria-hidden className="absolute bottom-6 left-[22px] top-6 hidden w-px bg-border sm:block">
          <motion.span
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={reduce ? { duration: 0 } : { duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top" }}
            className="absolute inset-0 bg-foreground/20"
          />
        </span>

        <div className="space-y-3">
          {modules.map((m, mi) => {
            const done = m.lessons.filter((l) => l.state === "done").length
            const allDone = done === m.lessons.length
            const isOpen = openMod === mi
            return (
              <InView key={m.title} once delay={mi * 0.06}>
                <div className="relative pl-0 sm:pl-14">
                  <span
                    className={cn(
                      "absolute left-0 top-5 hidden size-7 place-items-center rounded-full border text-[11px] font-bold sm:grid",
                      allDone ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground"
                    )}
                    aria-hidden
                  >
                    {allDone ? <CheckCircle2 className="size-4" /> : mi + 1}
                  </span>

                  <Button type='button' aria-expanded={isOpen} aria-controls={`module-${mi}`} onClick={() => setOpenMod(isOpen ? -1 : mi)} className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 text-left shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isOpen && "border-foreground/20 bg-card"
                    )} variant="default">
                    <div className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60")}>mi + 1<span className="opacity-50"> / modules.length</span></span>
                        <span className="font-display text-[17px] font-bold tracking-tight text-foreground">{m.title}</span>
                      </span>
                      <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{m.note}</span>
                    </div>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="hidden font-mono text-[11px] font-medium text-muted-foreground sm:inline">
                        {done}/{m.lessons.length}
                      </span>
                      <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden />
                    </span>
                  </Button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.ul
                        id={`module-${mi}`}
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pt-2">
                          {m.lessons.map((l, li) => (
                            <li key={l.title}>
                              <Button type='button' disabled={l.state === "locked"} onClick={() => onLessonClick?.(mi, li)} className={cn(
                                  "flex w-full items-center gap-3 rounded-lg border bg-background px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  l.state === "locked" ? "cursor-not-allowed opacity-60" : "hover:border-foreground/15 hover:bg-muted/40"
                                )} variant="default">
                                {l.state === "done" ? (
                                  <CheckCircle2 className="size-4 shrink-0 text-foreground" aria-hidden />
                                ) : l.state === "locked" ? (
                                  <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                                ) : (
                                  <span aria-hidden className="size-1.5 rounded-full bg-foreground" />
                                )}
                                <span className={cn("flex-1 font-medium", l.state === "done" && "text-muted-foreground line-through")}>{l.title}</span>
                                <span className="font-mono text-[11px] font-medium text-muted-foreground">{l.minutes} min</span>
                              </Button>
                            </li>
                          ))}
                        </div>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </InView>
            )
          })}
        </div>
      </div>
    
  </div>
</section>
  )
}
