import * as React from "react"
import { motion } from "motion/react"
import { Loader2 } from "lucide-react"
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

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const REVEAL = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

type ServiceStatus = "operational" | "degraded"

type ServiceDef = {
  id: string
  name: string
  status: ServiceStatus
  latency: string
  region: string
  incident: string
}

const SERVICES: ServiceDef[] = [
  {
    id: "bookings-api",
    name: "Bookings API",
    status: "operational",
    latency: "p95 · 182 ms",
    region: "eu-north-1 · Stockholm",
    incident: "2026-07-14 · 4 min · webhook retry storm",
  },
  {
    id: "sms-gateway",
    name: "SMS gateway",
    status: "degraded",
    latency: "p95 · 1.9 s",
    region: "eu-central-1 · Frankfurt",
    incident: "2026-08-24 · delayed delivery to SE operators",
  },
  {
    id: "payments",
    name: "Payments",
    status: "operational",
    latency: "p95 · 312 ms",
    region: "eu-north-1 · Stockholm",
    incident: "2026-05-02 · 11 min · PSP timeouts",
  },
  {
    id: "media-cdn",
    name: "Media CDN",
    status: "operational",
    latency: "p95 · 88 ms",
    region: "global · 14 edge PoPs",
    incident: "No incidents in the last 90 days",
  },
]

function StatusPill({
  service,
  open,
  onOpenChange,
}: {
  service: ServiceDef
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [checking, setChecking] = React.useState(false)
  const timer = React.useRef<number | null>(null)
  const reduced = React.useMemo(prefersReducedMotion, [])

  React.useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: "bottom",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ])

  function runCheck() {
    if (checking) return
    setChecking(true)
    timer.current = window.setTimeout(() => setChecking(false), 1200)
  }

  const operational = service.status === "operational"

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        ref={refs.setReference}
        {...getReferenceProps()}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            operational ? "bg-primary" : "bg-muted-foreground motion-safe:animate-pulse",
          )}
        />
        {service.name}
      </Button>
      {open && (
        <FloatingPortal>
          <motion.div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            initial={reduced ? false : { opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="z-50 w-64 rounded-xl border bg-card p-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-foreground">{service.name}</p>
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                <span
                  aria-hidden
                  className={cn("size-1.5 rounded-full", operational ? "bg-primary" : "bg-muted-foreground")}
                />
                <span className={operational ? "text-primary" : "text-muted-foreground"}>
                  {service.status}
                </span>
              </span>
            </div>
            <dl className="mt-3 space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[11px] text-muted-foreground">Latency</dt>
                <dd className="font-mono text-[11px] font-bold text-foreground">{service.latency}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[11px] text-muted-foreground">Region</dt>
                <dd className="font-mono text-[11px] font-bold text-foreground">{service.region}</dd>
              </div>
            </dl>
            <div className="mt-3 border-t border-border pt-3">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">Last incident</span>
              <p className="mt-1.5 font-mono text-[10px] leading-4 text-muted-foreground">
                {service.incident}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={runCheck}
              disabled={checking}
              aria-busy={checking}
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border text-[11px] font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {checking ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Checking…
                </>
              ) : (
                "Run check"
              )}
            </Button>
          </motion.div>
        </FloatingPortal>
      )}
    </>
  )
}

export type FloatingStatusPillsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function FloatingStatusPills({
  eyebrow = "App · Reliability",
  title = "Status pills",
  subtitle = "Each service answers for itself — open a pill for latency, region and the last incident, then run a live check.",
  caption = "Quiet Times Studio — ops board, updated every 60 s",
  tone = "paper",
  className,
}: FloatingStatusPillsProps) {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const degraded = SERVICES.filter((s) => s.status !== "operational").length

  return (
    <section className={cn("bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
      <InView once variants={REVEAL} transition={{ duration: 0.8, ease: EASE }}>
                <header className="">
          {eyebrow != null && (
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
          )}
          <h2 className="text-3xl font-semibold tracking-tight sm:text-[34px] text-foreground">{title}</h2>
          {subtitle != null && (
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          )}
        </header>
      </InView>
      <div className="mt-10 flex flex-wrap items-center gap-2.5">
        {SERVICES.map((service) => (
          <StatusPill
            key={service.id}
            service={service}
            open={openId === service.id}
            onOpenChange={(o) => setOpenId(o ? service.id : null)}
          />
        ))}
        <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {SERVICES.length} services · {degraded} degraded
        </span>
      </div>
      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    </div>
    </section>
  )
}
