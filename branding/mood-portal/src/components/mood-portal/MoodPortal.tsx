import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tilt } from "@/components/primitives/tilt"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// ═══ JOB      show the mood of the brand as an openable object
// ═══ EMOTION  curiosity through a keyhole — petals of atmosphere
// ═══ SIGNATURE aperture petals: blob-shaped colour fields that tilt toward
//               the cursor; one opens a spring-morph dialog with Radix
//               focus handling, the note set in serif italic. Text colour on each
//               petal is computed from the mood tint, not guessed per id.
//   SITE      → studio about pages, interior/hospitality brands
//   APP       → board/collection pickers; petals are data
//   BUILD     shadcn Dialog (Radix focus trap, Esc, scroll lock) replacing the
//             native-dialog getElementById hack from wave-2; luminance maths
//             for foreground; tones are DATA
//   A11Y      triggers are real buttons with focus rings; dialog title/desc
//             wired via aria; only one dialog instance, keyed by selection

export type MoodCard = {
  id: string
  label: string
  note: string
  /** Token name without the --app- prefix, e.g. "mood-dawn". Resolves via bg-app-{token}. */
  token: string
  /** Concrete fallback hex so the petal has visible colour even when --app-* tokens are unset. */
  hex: string
  /** Force ink/paper text. Auto-derived by lightness when absent. */
  ink?: "light" | "dark"
}

export type MoodPortalProps = {
  moods?: MoodCard[]
  eyebrow?: string
  className?: string
  /** Fires when a mood is opened. */
  onOpen?: (m: MoodCard) => void
}

const MOOD_PALETTE: Record<string, string> = {
  dawn: "#F2D5A0",
  ink: "#111111",
  moss: "#4F7A4A",
  clay: "#C68B5E",
}

const DEFAULT_MOODS: MoodCard[] = [
  { id: "dawn", label: "Dawn studio", note: "First light through north glass — the brand before the noise.", token: "mood-dawn", hex: MOOD_PALETTE.dawn, ink: "dark" },
  { id: "ink", label: "Wet ink", note: "Black ink pooling on cotton paper. Decisions, permanent.", token: "mood-ink", hex: MOOD_PALETTE.ink },
  { id: "moss", label: "Moss wall", note: "The quiet green of work that compounds slowly.", token: "mood-moss", hex: MOOD_PALETTE.moss },
  { id: "clay", label: "Raw clay", note: "Unfired, honest material. Every brand starts here.", token: "mood-clay", hex: MOOD_PALETTE.clay, ink: "dark" },
]

/** Derive light/dark ink from a hex (auto fallback when not forced). */
function derivedInk(hex: string, forced?: "light" | "dark"): "light" | "dark" {
  if (forced) return forced
  const h = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.55 ? "dark" : "light"
}

function petalRadius(i: number) {
  return i % 2 ? "50% 50% 12% 12% / 34% 34% 6% 6%" : "12% 12% 50% 50% / 6% 6% 34% 34%"
}

export function MoodPortal({ moods = DEFAULT_MOODS, eyebrow = "MOOD · THE FEEL IN OBJECTS", className, onOpen }: MoodPortalProps) {
  const reduced = useReducedMotion()
  const [open, setOpen] = React.useState<string | null>(null)
  const active = moods.find((m) => m.id === open) ?? null

  return (
    <section className={cn("bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <header className="">
          {eyebrow != null && (            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>          )}
          <h2 className="mt-2 tracking-tight text-3xl font-bold tracking-tight sm:text-4xl text-foreground">{<>Four objects. <em className="font-serif italic font-medium">One temperature.</em></>}</h2>
        </header>
        <Badge variant="outline" className="mb-1 hidden font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:inline-flex">open a petal</Badge>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {moods.map((m, i) => {
          const ink = derivedInk(m.hex, m.ink)
          return (
            <Tilt key={m.id} className="h-[300px]" rotationFactor={8}>
              <Dialog open={open === m.id} onOpenChange={(o) => { setOpen(o ? m.id : null); if (o) onOpen?.(m) }}>
                <DialogTrigger asChild>
                  <motion.button
                    type="button"
                    aria-label={`Open mood: ${m.label}`}
                    whileHover={reduced ? undefined : { scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    style={{ background: m.hex, color: ink === "dark" ? "hsl(var(--foreground))" : "hsl(var(--background))", borderRadius: petalRadius(i) }}
                    className={cn(
                      "group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl p-6 pl-8 text-left",
                      "shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)] outline-none ring-offset-2 ring-offset-background",
                      "focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    )}
                  >
                    <ArrowUpRight aria-hidden className="absolute right-4 top-4 size-5 opacity-60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mt-1 font-display text-xl font-black tracking-tight">{m.label}</span>
                    <p className="mt-2 max-w-[220px] text-[13px] font-medium leading-relaxed opacity-80">{m.note}</p>
                  </motion.button>
                </DialogTrigger>
                {active?.id === m.id && (
                  <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[480px]">
                    <motion.div
                      initial={reduced ? false : { scale: 0.72, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={reduced ? undefined : { scale: 0.72, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      style={{ background: active!.hex, color: derivedInk(active!.hex, active!.ink) === "dark" ? "hsl(var(--foreground))" : "hsl(var(--background))" }}
                      className="flex h-44 items-end p-6"
                    >
                      <DialogHeader className="text-left">
                        <DialogTitle className="font-display text-2xl font-black tracking-tight">{active!.label}</DialogTitle>
                      </DialogHeader>
                    </motion.div>
                    <div className="space-y-4 p-6">
                      <DialogDescription asChild>
                        <p className="font-serif text-lg italic leading-relaxed text-foreground">{active!.note}</p>
                      </DialogDescription>
                      <Separator />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(null)} className="gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em]">
                          Close <ArrowUpRight className="size-3.5 -rotate-45" aria-hidden />
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </Tilt>
          )
        })}
      </div>
    </div>
    </section>
  )
}
