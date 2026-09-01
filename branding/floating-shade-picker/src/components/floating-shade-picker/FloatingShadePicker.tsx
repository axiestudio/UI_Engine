import * as React from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import {
  FloatingPortal,
  useFloating,
  useInteractions,
  useClick,
  useDismiss,
  useRole,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"

// content data: brand palette
const BASE_SWATCHES = [
  { name: "Studio Teal", hex: "#0F766E" },
  { name: "Amber Clay", hex: "#B45309" },
  { name: "Violet Hour", hex: "#7C3AED" },
  { name: "Rosewood", hex: "#BE185D" },
  { name: "Salon Blue", hex: "#1D4ED8" },
  { name: "Fern", hex: "#15803D" },
  { name: "Signal Red", hex: "#DC2626" },
  { name: "Brass", hex: "#CA8A04" },
] as const

const WHITE = "#FFFFFF"
const BLACK = "#141414"

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const REVEAL = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "")
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase()
}

function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

function shadeScale(base: string): string[] {
  return [
    mixHex(base, WHITE, 0.55),
    mixHex(base, WHITE, 0.25),
    base,
    mixHex(base, BLACK, 0.28),
    mixHex(base, BLACK, 0.55),
  ]
}

function ShadeSwatch({
  name,
  hex,
  index,
  total,
  open,
  onOpenChange,
}: {
  name: string
  hex: string
  index: number
  total: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [copied, setCopied] = React.useState<string | null>(null)
  const copyTimer = React.useRef<number | null>(null)
  const reduced = React.useMemo(prefersReducedMotion, [])

  React.useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    }
  }, [])

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: "bottom",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ])

  const scale = React.useMemo(() => shadeScale(hex), [hex])

  async function copyHex(value: string) {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(value)
    } catch {
      /* clipboard unavailable */
    }
    setCopied(value)
    if (copyTimer.current) window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button type="button" variant="ghost"
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${name} ${hex} — open shade scale`}
        title={`${name} · ${hex}`}
        className={cn(
          "size-14 rounded-xl border border-border transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
        style={{ backgroundColor: hex }}
       h-auto />
      <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}<span className="opacity-50"> / {String(total).padStart(2, "0")}</span></span>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {name}
      </span>
      {open && (
        <FloatingPortal>
          <motion.div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            initial={reduced ? false : { opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="z-50 w-56 rounded-xl border bg-card p-2 shadow-xl"
          >
            <div className="flex items-center justify-between px-1.5 pb-2 pt-1">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px]">{name}</span>
              <span className="font-mono text-[10px] font-bold text-muted-foreground">{hex}</span>
            </div>
            <div className="space-y-0.5">
              {scale.map((value) => (
                <Button type="button" variant="ghost"
                  key={value}
                  type="button"
                  onClick={() => copyHex(value)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >>
                  <span
                    aria-hidden
                    className="h-5 flex-1 rounded-md border border-border"
                    style={{ backgroundColor: value }}
                  />
                  {copied === value ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-primary">
                      <Check className="size-3" aria-hidden />
                      Copied ✓
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] font-semibold text-muted-foreground">{value}</span>
                  )}
                </Button>
              ))}
            </div>
            <p aria-live="polite" className="sr-only">
              {copied ? `${copied} copied to clipboard` : ""}
            </p>
          </motion.div>
        </FloatingPortal>
      )}
    </div>
  )
}

export type FloatingShadePickerProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function FloatingShadePicker({
  eyebrow = "Brand System · Palette",
  title = "Shade picker",
  subtitle = "Pick one of the eight studio bases — the popover mixes a five-step scale from the base hex live, ready to copy into any spec sheet.",
  caption = "Quiet Times Studio — brand palette v2.1",
  tone = "paper",
  className,
}: FloatingShadePickerProps) {
  const [openHex, setOpenHex] = React.useState<string | null>(null)

  return (
    <section className={cn("bg-background text-foreground", className)>
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <InView once variants={REVEAL} transition={{ duration: 0.8, ease: EASE }}>
                <header className="">
          {eyebrow != null && (            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>          )}
          <h2 className="mt-2 tracking-tight text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">{title}</h2>
          {subtitle != null && (            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>          )}
        </header>
      </InView>
      <div className="mt-10 flex flex-wrap gap-x-4 gap-y-8">
        {BASE_SWATCHES.map((swatch, i) => (
          <ShadeSwatch
            key={swatch.hex}
            name={swatch.name}
            hex={swatch.hex}
            index={i}
            total={BASE_SWATCHES.length}
            open={openHex === swatch.hex}
            onOpenChange={(o) => setOpenHex(o ? swatch.hex : null)}
          />
        ))}
      </div>
      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    </div>
    </section>
  )
}
