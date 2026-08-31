import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check, Copy, PenLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, CornerTicks } from "@/components/primitives/handcraft"
import { TextEffect } from "@/components/primitives/text-effect"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// ═══ JOB      make the manifesto land as one unbroken voice
// ═══ EMOTION  held breath, then agreement — ink on paper
// ═══ SIGNATURE an inverted ink band: the manifesto reveals word-by-word
//               (TextEffect), the band is signed with a press-seal that
//               stamps SIGNED · SEALED in letterpress ink, and the statement
//               copies to clipboard with receipt
//   SITE      → manifesto/about chapters, campaign pages
//   APP       → values onboarding splash
//   BUILD     shadcn new-york-v4 Button/Badge/Separator + motion (reduced-motion:
//             static text, instant stamp) + handcraft shell/ticks/grain
//   A11Y      full text present for AT; seal is a real button w/ aria-pressed;
//             status announced via aria-live; focus rings on the ink band

export type InkTrustProps = {
  /** The one-sentence-to-a-paragraph belief being signed. */
  statement?: string
  /** Attribution under the statement, e.g. "— the partners, in ink". */
  signoff?: string
  /** Badge copy in the header row. */
  chapterLabel?: string
  /** Called whenever the sealed state flips. */
  onSignChange?: (sealed: boolean) => void
  className?: string
}

const SIGNATURE_FONT =
  "font-serif text-[26px] font-medium italic leading-[1.5] tracking-normal sm:text-[34px]"

export function InkTrust({
  statement = "We would rather lose a deal than ship work we wouldn't sign. Every pixel here was argued for, drawn twice, and finished once.",
  signoff = "— the partners, in ink",
  chapterLabel = "MANIFESTO · IN INK",
  onSignChange,
  className,
}: InkTrustProps) {
  const reduced = useReducedMotion()
  const [sealed, setSealed] = React.useState(false)
  const [copied, setCopied] = React.useState<"idle" | "copied" | "failed">("idle")

  React.useEffect(() => {
    if (copied === "idle") return
    const t = window.setTimeout(() => setCopied("idle"), 2200)
    return () => window.clearTimeout(t)
  }, [copied])

  const toggleSeal = () => {
    setSealed((s) => {
      const next = !s
      onSignChange?.(next)
      return next
    })
  }

  const copyStatement = async () => {
    try {
      await navigator.clipboard.writeText(statement)
      setCopied("copied")
    } catch {
      setCopied("failed")
    }
  }

  return (
    <SectionShell width={760} tone="ink" grain padding="grand" className={cn("text-background", className)}>
      <CornerTicks corners={["tl", "br"]} className="text-background/30" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <MonoLabel className="text-background/55">{chapterLabel}</MonoLabel>
        <Badge
          variant="outline"
          className={cn(
            "border-background/30 bg-transparent font-mono text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
            sealed ? "text-background/90" : "text-background/55",
          )}
        >
          {sealed ? "Sealed" : "Unsigned"}
        </Badge>
      </div>

      <InView once className="mt-8">
        {reduced ? (
          <p className={SIGNATURE_FONT}>{statement}</p>
        ) : (
          <TextEffect per="word" as="p" preset="blur" speedReveal={1.5} className={SIGNATURE_FONT}>
            {statement}
          </TextEffect>
        )}
      </InView>

      <div className="mt-12 flex items-center gap-4">
        <Separator className="w-14 shrink-0 bg-background/40" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-background/60">
          {signoff}
        </span>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={sealed}
          onClick={toggleSeal}
          className={cn(
            "gap-2 rounded-full bg-transparent font-mono text-[10px] font-black uppercase tracking-[0.16em]",
            sealed
              ? "border-background/60 text-background hover:bg-background/10 hover:text-background"
              : "border-background/30 text-background/75 hover:bg-background/10 hover:text-background",
            "focus-visible:ring-background/50",
          )}
        >
          {sealed ? <Check className="size-3.5" aria-hidden /> : <PenLine className="size-3.5" aria-hidden />}
          {sealed ? "Signed & sealed" : "Sign the manifesto"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void copyStatement()}
          className="gap-2 rounded-full font-mono text-[10px] font-black uppercase tracking-[0.16em] text-background/60 hover:bg-background/10 hover:text-background focus-visible:ring-background/50"
        >
          {copied === "copied" ? <Check className="size-3.5 text-background" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied === "copied" ? "Copied" : copied === "failed" ? "Select & copy" : "Copy"}
        </Button>

        <span aria-live="polite" className="sr-only">
          {sealed ? "Statement signed and sealed." : "Statement unsigned."}
          {copied === "copied" ? " Manifesto copied to clipboard." : ""}
        </span>

        {/* letterpress seal — stamps in once signed, lifts off when un-signed */}
        {sealed && (
          <motion.div
            key="seal"
            initial={reduced ? false : { scale: 1.9, opacity: 0, rotate: -22 }}
            animate={{ scale: 1, opacity: 1, rotate: -8 }}
            transition={{ type: "spring", stiffness: 340, damping: 17 }}
            aria-hidden
            className="relative ml-auto grid size-[76px] shrink-0 -translate-y-1 place-items-center rounded-full border-2 border-background/55"
          >
            <span className="absolute inset-[7px] rounded-full border border-dashed border-background/35" />
            <span className="text-center font-mono text-[8px] font-black uppercase leading-[1.5] tracking-[0.2em] text-background/75">
              signed · sealed
              <br />
              MMXXVI
            </span>
          </motion.div>
        )}
      </div>
    </SectionShell>
  )
}
