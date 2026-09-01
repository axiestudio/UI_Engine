import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { PenLine, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GhostSuggestInput } from "ghost-suggest-input"
import { CitationHoverCard, type Source } from "citation-hover-card"
import { AiChangeReview, type Hunk } from "ai-change-review"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · CONTRACT REVIEW
// composed of: ghost-suggest-input (clause drafting with ghost continuations),
// citation-hover-card (precedent cites that lift), ai-change-review (agent
// redlines accepted per hunk), toast-stack (hunk notices) + purpose-built
// matter audit trail.

export type LegalClauseDeskProps = {
  matter?: string
  counterparty?: string
  onSent?: () => void
  className?: string
}

const SOURCES: Source[] = [
  { n: 1, title: "Akershus Logistik v. NordSupply (2023)", domain: "practicelaw.se", snippet: "Court held a 12-month fees cap with indemnity carve-out was a fair allocation of risk between parties of this size." },
  { n: 2, title: "Model clause library — data processing", domain: "internal.handbook", snippet: "Written consent for new sub-processors is the house standard; notice-only has been rejected in the last three counterparty rounds." },
]

const HUNKS: Hunk[] = [
  {
    id: "h1",
    file: "§11 — Limitation of liability",
    title: "Cap carve-out",
    from: "Each party's aggregate liability shall not exceed the fees paid under this agreement.",
    to: "Each party's aggregate liability shall not exceed the fees paid in the twelve (12) months preceding the claim, excluding indemnity obligations under §9.",
  },
  {
    id: "h2",
    file: "§7 — Data processing",
    title: "Sub-processor consent",
    from: "The Processor may engage sub-processors with reasonable notice to the Controller.",
    to: "The Processor shall obtain the Controller's written consent before engaging any new sub-processor, notice alone being insufficient.",
  },
  {
    id: "h3",
    file: "§14 — Term and termination",
    title: "Notice period",
    from: "Either party may terminate this agreement with thirty (30) days notice.",
    to: "Either party may terminate this agreement for convenience with ninety (90) days written notice, per the counterparty's procurement standard.",
  },
]

const SUGGESTIONS: [RegExp, string][] = [
  [/liabilit(y|ies)$/i, " shall be limited to the fees paid in the twelve (12) months preceding the claim."],
  [/terminat(e|es|ion)$/i, " for convenience requires ninety (90) days written notice to the other party."],
  [/confidential(ity)?$/i, " obligations survive termination for a period of three (3) years."],
  [/indemnif(y|ies|ication)$/i, " under §9 is excluded from the aggregate cap set out in this section."],
]

export function LegalClauseDesk({ matter = "2024-0117 · MSA renewal", counterparty = "NordSupply AB", onSent, className }: LegalClauseDeskProps) {
  const [draft, setDraft] = useState("The parties agree that each party's liability")
  const [resolved, setResolved] = useState<Record<string, "accepted" | "rejected">>({})
  const [audit, setAudit] = useState<{ at: string; text: string }[]>([
    { at: "13:41", text: "matter opened · v4 received from counterparty" },
    { at: "13:47", text: "exported review copy to matter file" },
    { at: "14:02", text: "agent redlines proposed — 3 hunks" },
  ])
  const [sent, setSent] = useState<null | { at: string }>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((ts) => [...ts.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const suggest = (v: string): string | null => {
    const hit = SUGGESTIONS.find(([re]) => re.test(v.trimEnd()))
    return hit ? hit[1] : null
  }

  const decide = (h: Hunk, call: "accepted" | "rejected") => {
    setResolved((r) => ({ ...r, [h.id]: call }))
    const at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setAudit((a) => [...a, { at, text: `redline ${call} · ${h.file}` }])
    push(`${h.title} ${call}`, call === "accepted" ? "ok" : "warn")
  }

  const pending = HUNKS.filter((h) => !resolved[h.id]).length

  const send = () => {
    setSent({ at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
    setAudit((a) => [...a, { at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), text: "marked-up draft sent to counterparty" }])
    onSent?.()
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Clause review</h2>
        <span className="text-[12px] text-muted-foreground">{matter}</span>
        <span className="text-[12px] text-muted-foreground">· vs {counterparty}</span>
        <span className={cn("text-[12px] font-semibold", pending === 0 ? "text-[hsl(var(--ok))]" : "text-muted-foreground")}>{HUNKS.length - pending}/{HUNKS.length} redlines resolved</span>
        <Button type="button" variant="ghost" onClick={send} disabled={pending > 0 || !!sent} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40">
          <Send className="size-3.5" /> {sent ? `Sent · ${sent.at}` : "Send to counterparty"}
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* document */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Agreement · master services agreement v4</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">14 sections · 2 flagged</span>
          </header>
          <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4 text-[13px] leading-[1.75]">
            <p>
              This agreement governs the supply of logistics services as of 1 January. The parties acknowledge the framework terms
              previously exchanged and incorporate them by reference
              <CitationHoverCard sources={[SOURCES[0]]}>[1]</CitationHoverCard>. Fees are reviewed annually against the index agreed in the
              pricing schedule.
            </p>
            <p>
              The Processor processes personal data solely on documented instructions
              <CitationHoverCard sources={[SOURCES[1]]}>[2]</CitationHoverCard> and maintains technical and organisational measures appropriate
              to the risk. Breach notification follows the statutory seventy-two (72) hour window.
            </p>
            <div className="rounded-lg border border-dashed bg-background p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <PenLine className="size-3.5" /> §11 drafting — ghost continuations on
          </MotionConfig>
    </div>
              <GhostSuggestInput
                value={draft}
                onChange={setDraft}
                suggest={suggest}
                label="continue the clause — end a line with liability, termination, confidentiality or indemnify"
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">Press tab to accept the ghosted continuation · house language is drawn from the precedent bank.</p>
            </div>
          </div>
        </section>

        {/* redlines + audit */}
        <aside className="flex min-h-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Agent redlines</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{pending} pending</span>
            </header>
            <div className="p-3">
              <AiChangeReview
                hunks={HUNKS}
                onAccept={(id: string) => {
                  const h = HUNKS.find((x) => x.id === id)
                  if (h && !resolved[id]) decide(h, "accepted")
                }}
                onReject={(id: string) => {
                  const h = HUNKS.find((x) => x.id === id)
                  if (h && !resolved[id]) decide(h, "rejected")
                }}
              />
            </div>
          </section>
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Matter audit</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{audit.length}</span>
            </header>
            <ul className="min-h-0 flex-1 divide-y divide-border/60 overflow-auto">
              <AnimatePresence initial={false}>
                {audit.map((a, i) => (
                  <motion.li key={`${a.at}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 px-3 py-1.5">
                    <span className="w-10 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{a.at}</span>
                    <span className="text-[12px] leading-snug">{a.text}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Audit is append-only · every accept and export is stamped.</div>
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} pos="br" />
    </div>
  )
}
