import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// The layer components — head, task rows (repeat like fillings), progress rail, base.
import { BoardTop } from "./layers/BoardTop"
import { BoardTask } from "./layers/BoardTask"
import { BoardProgress } from "./layers/BoardProgress"
import { BoardBase } from "./layers/BoardBase"

// ═══ JOB         Get a new user to first value, one honest row at a time.
// ═══ EMOTION     A checklist that wants to be finished — quiet momentum.
// ═══ SIGNATURE   The base lights up: tick the last filling and the CTA
//                 snaps from muted to ink with a spring, while the progress
//                 rail fills. Rows are components — add or remove freely.

export type OnboardTaskDef = { label: string; hint?: string }

export type StackOnboardProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  heading?: string
  headingSub?: string
  tasks?: OnboardTaskDef[]
  cta?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function StackOnboard({
  eyebrow = "STACK · ONBOARDING",
  title = "A checklist built from layers.",
  subtitle = "Head band, task rows, progress rail and action base are separate components — rows repeat like fillings. Tick them all and the base CTA snaps awake.",
  heading = "Welcome in",
  headingSub = "Four steps and the studio is yours.",
  tasks = [
    { label: "Set your opening hours", hint: "the board books around them" },
    { label: "Add your first client", hint: "or import a CSV" },
    { label: "Name your chairs", hint: "03 is luckier than 4" },
    { label: "Send one booking link", hint: "copy it anywhere" },
  ],
  cta = "Enter the studio",
  caption = "FOUR LAYER COMPONENTS · REPEATABLE FILLINGS",
  tone = "paper",
  className,
}: StackOnboardProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const [done, setDone] = React.useState<boolean[]>(() => tasks.map(() => false))
  const count = done.filter(Boolean).length
  const ready = count === tasks.length && tasks.length > 0

  const toggle = (i: number) =>
    setDone((cur) => cur.map((v, x) => (x === i ? !v : v)))

  return (
    <section className={cn("bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
                <header className="">
          {eyebrow != null && (
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
          )}
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">{title}</h2>
          {subtitle != null && (
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          )}
        </header>
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10">
          <div className="mx-auto max-w-[460px]">
            <motion.div
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className={cn(
                "overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              <BoardTop title={heading} subtitle={headingSub} done={count} total={tasks.length} />

              {/* task rows — the repeatable fillings */}
              <div role="group" aria-label="Onboarding steps">
                {tasks.map((task, i) => (
                  <motion.div
                    key={task.label}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.07 }}
                  >
                    <BoardTask
                      label={task.label}
                      hint={task.hint}
                      done={done[i]}
                      onToggle={() => toggle(i)}
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              >
                <BoardProgress done={count} total={tasks.length} />
                <BoardBase ready={ready} cta={cta} onCta={() => {}} onSkip={() => {}} />
              </motion.div>
            </motion.div>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[460px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-hidden className="tabular-nums">{String(count).padStart(2, "0")} / {String(tasks.length).padStart(2, "0")}</span>
            </figcaption>
          )}
        </figure>
      </InView>
    </div>
    </section>
  )
}
