import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// The layer components — head, meta band, module rows (repeat), base.
import { CourseHead } from "./layers/CourseHead"
import { CourseMeta } from "./layers/CourseMeta"
import { CourseModule } from "./layers/CourseModule"
import { CourseBase } from "./layers/CourseBase"

// ═══ JOB         Show the whole path before asking for the enroll.
// ═══ EMOTION     A trail you can already see yourself walking.
// ═══ SIGNATURE   The modules are the fillings: done/active/locked states
//                 read at a glance, rows stagger in like a syllabus being
//                 dealt. Head, meta, modules and base are separate imports.

export type CourseModuleDef = {
  title: string
  lessons?: number
  duration?: string
  state?: "done" | "active" | "locked"
}

export type StackCourseProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  head?: { title: string; instructor?: string; level?: string }
  meta?: { modules?: string; lessons?: string; duration?: string }
  modules?: CourseModuleDef[]
  price?: string
  cta?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function StackCourse({
  eyebrow = "STACK · COURSE",
  title = "The syllabus, dealt open.",
  subtitle = "Course band, meta strip, module rows and enroll base are separate components — modules repeat like fillings with done / active / locked states.",
  head = { title: "Booking Boards That Don't Lie", instructor: "Klara Lindqvist", level: "Beginner friendly" },
  meta = { modules: "6 modules", lessons: "24 lessons", duration: "4 h 20 m" },
  modules = [
    { title: "What a board owes the floor", lessons: 4, duration: "38 min", state: "done" },
    { title: "Time you can actually sell", lessons: 5, duration: "52 min", state: "active" },
    { title: "Chairs, mirrors and truth", lessons: 4, duration: "41 min", state: "locked" },
    { title: "Reminders people answer", lessons: 4, duration: "44 min", state: "locked" },
    { title: "The no-show autopsy", lessons: 4, duration: "47 min", state: "locked" },
    { title: "Ship your board", lessons: 3, duration: "38 min", state: "locked" },
  ],
  price = "1 490 kr",
  cta = "Enroll now",
  caption = "FOUR LAYER COMPONENTS · REPEATABLE MODULES",
  tone = "paper",
  className,
}: StackCourseProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10">
          <div className="mx-auto max-w-[520px]">
            <div
              className={cn(
                "overflow-hidden rounded-[18px] border bg-card shadow-[0_26px_56px_-30px_hsl(var(--foreground)/0.45)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              <CourseHead title={head.title} instructor={head.instructor} level={head.level} />
              <CourseMeta modules={meta.modules} lessons={meta.lessons} duration={meta.duration} />

              <div role="list" aria-label="Course modules">
                {modules.map((m, i) => (
                  <motion.div
                    key={m.title}
                    role="listitem"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.07 }}
                  >
                    <CourseModule index={i + 1} title={m.title} lessons={m.lessons} duration={m.duration} state={m.state} />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              >
                <CourseBase price={price} cta={cta} />
              </motion.div>
            </div>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[520px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    
  </div>
</section>
  )
}
