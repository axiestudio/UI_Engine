import * as React from "react"
import { motion } from "motion/react"
import { ExternalLink, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

import { Button } from "@/components/ui/button"
// ═══ JOB      make completion feel earned — credential, not confetti
// ═══ EMOTION  quiet pride — verified, not loud
// ═══ SIGNATURE centered credential card: verified rail, monogram plate, holder lockup, muted actions
//   SITE      → certification / completion pages
//   APP       → achievement detail; credential is data, share is an action

export type BadgeForgeProps = {
  title?: string
  holder?: string
  issued?: string
  id?: string
  verifyHref?: string
  onShare?: () => void
  onAddLinkedIn?: () => void
  className?: string
}

export function BadgeForge({
  title = "Certified Finisher",
  holder = "Alex Rivera",
  issued = "Aug 2026",
  id = "CF-2026-0817",
  verifyHref,
  onShare,
  onAddLinkedIn,
  className,
}: BadgeForgeProps) {
  const [copied, setCopied] = React.useState(false)
  const verifyUrl = verifyHref ?? `/verify/${id.toLowerCase()}`
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const handleShare = async () => {
    if (onShare) return onShare()
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  return (
    <SectionShell width={760} padding="grand" className={cn("bg-background", className)}>
      <div className="mx-auto flex max-w-[480px] flex-col items-center">
        <MonoLabel className="text-muted-foreground">CREDENTIAL · VERIFIED</MonoLabel>

        <InView
          once
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="mt-8 w-full"
        >
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* header */}
            <div className="flex flex-col items-center px-6 pb-7 pt-8 text-center sm:px-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-muted-foreground">
                <span aria-hidden className="size-1.5 rounded-full bg-foreground" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">Verified credential</span>
              </span>

              <div className="mt-6 grid size-16 place-items-center rounded-xl border bg-muted font-mono text-xs font-bold tracking-[0.2em] text-foreground">
                {id.slice(0, 2).toUpperCase()}
              </div>

              <h3 className="mt-4 font-display text-[22px] font-bold leading-none tracking-tight text-foreground">{title}</h3>
              <p className="mt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {id} · Issued {issued}
              </p>
            </div>

            <div className="border-y bg-muted/30 px-6 py-6 text-center sm:px-8">
              <p className="font-serif text-[15px] italic leading-none text-muted-foreground">awarded to</p>
              <p className="mt-2 font-display text-[30px] font-black tracking-tight text-foreground">{holder}</p>
              <a
                href={verifyUrl}
                className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Verify at {verifyUrl} <ExternalLink className="size-3" aria-hidden />
              </a>
            </div>

            <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:justify-center sm:px-6">
              <Button
                onClick={handleShare}
                aria-live="polite"
                className="w-full sm:w-auto"
              >
                <Share2 className="size-4" aria-hidden />
                {copied ? "Link copied" : "Share credential"}
              </Button>
              <Button
                variant="outline"
                onClick={onAddLinkedIn}
                className="w-full sm:w-auto"
              >
                Add to LinkedIn
              </Button>
            </div>
          </div>
        </InView>

        <p className="mt-6 max-w-[38ch] text-center font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          This credential is shareable and verifiable. Private details stay with you.
        </p>
      </div>
    </SectionShell>
  )
}
