import * as React from "react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import Terminal from "@/components/eldora/terminal"
import { CodeBlock } from "@/components/cult/code-block"

export type CodeRevealTab = { label: string; code: string; language?: string }

export type CodeRevealProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Command typed into the Eldora terminal. */
  command?: string
  /** Terminal output lines (bold marks the echo line). */
  steps?: { text: string; bold?: boolean }[]
  /** Code tabs shown in the Cult UI code block. */
  tabs?: CodeRevealTab[]
  className?: string
}

const DEFAULT_STEPS = [
  { text: "$ npm run lesson -- 03" },
  { text: "compiling … done in 842ms", bold: true },
  { text: "lesson 03 — shipped" },
]

const DEFAULT_TABS = [
  {
    label: "lesson-03.ts",
    language: "ts",
    code: [
      "import { ship } from '@workshop/craft'",
      "",
      "export function friday() {",
      "  const done = ship(small)",
      "  return celebrate(done)",
      "}",
    ].join("\n"),
  },
  {
    label: "deploy.sh",
    language: "bash",
    code: ["#!/usr/bin/env bash", "set -euo pipefail", "npm run lesson -- 03 && npm run ship -- friday"].join("\n"),
  },
]

export function CodeReveal({
  eyebrow = "Learning · Code reveal",
  title = "Lesson 03 — ship something small.",
  subtitle = "Terminal. Then code. Copy from the block, run it.",
  command = "npm run lesson -- 03",
  steps = DEFAULT_STEPS,
  tabs = DEFAULT_TABS,
  className,
}: CodeRevealProps) {
  return (
    <section className={cn("relative isolate overflow-hidden min-h-[400px] w-full", className)}>
      <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8")} style={{ maxWidth: 920 }}>
        <InView
          once
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <header className={cn("relative")}>
            {eyebrow && (
              <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}>
                <span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />
                {eyebrow}
              </span>
            )}
            <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", "text-foreground")}>{title}</h2>
            {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", "text-muted-foreground")}>{subtitle}</p>}
          </header>
        </InView>

        <InView
          once
          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="mt-10 flex flex-col gap-6">
            <Terminal command={command} steps={steps} showLocalhost={false} hostBarTitle="workshop · lesson 03" hostMessage="done" />
            <CodeBlock tabs={tabs} className="w-full" />
          </div>
        </InView>
      </div>
    </section>
  )
}
