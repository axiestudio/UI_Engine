import * as React from "react"
import { motion } from "motion/react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

export type CodeLine = { n: number; code: string; hi?: boolean }
export type CodeRevealProps = {
  title?: string
  lines?: CodeLine[]
  language?: string
  className?: string
}

const DEFAULT_LINES: CodeLine[] = [
  { n: 1, code: "import { ship } from '@workshop/craft'" },
  { n: 2, code: "" },
  { n: 3, code: "export function friday() {", hi: true },
  { n: 4, code: "  const done = ship(small)" },
  { n: 5, code: "  return celebrate(done)", hi: true },
  { n: 6, code: "}" },
]

export function CodeReveal({ title = "lesson-03.ts", lines = DEFAULT_LINES, language = "ts", className }: CodeRevealProps) {
  const [copied, setCopied] = React.useState(false)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const plain = lines.map((l) => l.code).join("\n")

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plain)
    } catch {}
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <SectionShell width={760} padding="tight" className={cn(className)}>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-3 rounded-full border bg-background" />
            <span className="size-3 rounded-full border bg-background" />
            <span className="size-3 rounded-full border bg-background" />
          </span>
          <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{title}</span>
          <span className="ml-2 hidden rounded-full border bg-background px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">{language}</span>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy code"
            aria-pressed={copied}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1 text-muted-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7" aria-label={plain}>
          <code aria-hidden>
            {lines.map((l, i) => (
              <motion.span
                key={l.n}
                className={cn("flex rounded-md px-1", l.hi && "bg-muted")}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.32, delay: 0.12 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="w-7 select-none pr-3 text-right text-muted-foreground/50">{l.n}</span>
                <span className="whitespace-pre text-foreground">
                  {l.code || " "}
                  {i === lines.length - 1 && !reduce && (
                    <motion.span
                      aria-hidden
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.1 }}
                      className="ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] bg-foreground"
                    />
                  )}
                </span>
              </motion.span>
            ))}
          </code>
        </pre>
      </div>

      <InView once className="mt-3 flex items-center justify-between">
        <MonoLabel className="text-muted-foreground text-[10px] tracking-[0.14em]">EXAMPLE · {lines.length} LINES</MonoLabel>
        <span aria-live="polite" className="font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground">
          {copied ? "Copied to clipboard" : ""}
        </span>
      </InView>
    </SectionShell>
  )
}
