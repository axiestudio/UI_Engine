import * as React from "react"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { Tilt } from "@/components/primitives/tilt"

// ═══ JOB      show the mood of the brand as an openable object
// ═══ EMOTION  curiosity through a keyhole — petals of atmosphere
// ═══ SIGNATURE aperture moodboard: 8 petals of imagery tilt toward your
//               cursor and open a morphing dialog with the full mood card
//   SITE      → studio about pages, interior/hospitality brands
//   APP       → board/collection pickers; petals are data
//   A11Y      dialog focus trap via primitive; buttons labeled

export type MoodCard = { id: string; label: string; note: string; tone: string }

export type MoodPortalProps = {
  moods?: MoodCard[]
  className?: string
}

const DEFAULT_MOODS: MoodCard[] = [
  { id: "dawn", label: "Dawn studio", note: "First light through north glass — the brand before the noise.", tone: "bg-[hsl(32_60%_88%)]" },
  { id: "ink", label: "Wet ink", note: "Black ink pooling on cotton paper. Decisions, permanent.", tone: "bg-[hsl(220_12%_14%)]" },
  { id: "moss", label: "Moss wall", note: "The quiet green of work that compounds slowly.", tone: "bg-[hsl(140_18%_38%)]" },
  { id: "clay", label: "Raw clay", note: "Unfired, honest material. Every brand starts here.", tone: "bg-[hsl(22_35%_62%)]" },
]

export function MoodPortal({ moods = DEFAULT_MOODS, className }: MoodPortalProps) {
  return (
    <SectionShell width={1120} className={className}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <MonoLabel className="text-muted-foreground">MOOD · THE FEEL IN OBJECTS</MonoLabel>
          <h2 className="mt-2 max-w-xl font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
            Four objects. <em className="font-serif italic font-medium">One temperature.</em>
          </h2>
        </div>
        <p className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:block">click a petal to open</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {moods.map((m, i) => (
          <Tilt key={m.id} className="h-[300px]">
            <motion.button
              type="button"
              aria-label={`${m.label}: ${m.note}`}
              onClick={() => {
                const dlg = document.getElementById(`mood-dlg-${m.id}`) as HTMLDialogElement | null
                dlg?.showModal()
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl border border-black/10 p-6 text-left text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]",
                m.tone,
                (m.id === "dawn" || m.id === "clay") && "text-[hsl(220_12%_14%)]"
              )}
              style={{ borderRadius: i % 2 ? "50% 50% 12% 12% / 34% 34% 6% 6%" : "12% 12% 50% 50% / 6% 6% 34% 34%" }}
            >
              <ArrowUpRight className="absolute right-4 top-4 size-5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-70">0{i + 1}</span>
              <span className="mt-1 font-display text-xl font-black tracking-tight">{m.label}</span>
              <p className="mt-2 max-w-[220px] text-[13px] font-medium leading-relaxed opacity-80">{m.note}</p>
            </motion.button>
          </Tilt>
        ))}
      </div>

      {/* native dialogs with morph-in (no nested state, works in engine + app) */}
      {moods.map((m) => (
        <dialog key={m.id} id={`mood-dlg-${m.id}`} className="m-auto w-[min(92vw,480px)] rounded-2xl border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50">
          <div className={cn("flex h-44 items-end rounded-t-2xl p-6", m.tone, (m.id === "dawn" || m.id === "clay") ? "text-[hsl(220_12%_14%)]" : "text-white")}>
            <span className="font-display text-2xl font-black tracking-tight">{m.label}</span>
          </div>
          <div className="p-6">
            <p className="font-serif text-lg italic leading-relaxed">{m.note}</p>
            <button type="button" onClick={() => (document.getElementById(`mood-dlg-${m.id}`) as HTMLDialogElement)?.close()}
              className="mt-6 rounded-full bg-foreground px-5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-background">
              Close
            </button>
          </div>
        </dialog>
      ))}
    </SectionShell>
  )
}
