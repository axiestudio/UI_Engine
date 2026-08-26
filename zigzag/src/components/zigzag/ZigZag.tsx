import * as React from "react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// ZigZag — standalone generic copy of Habesha's ZigZagVehicle.tsx
// 860vh wrapper (elongated via content, was 580vh), sticky 100svh viewport
// vehicle travels invisible zig-zag LEFT→DOWN→RIGHT→DOWN… via KEYS + getPos
// continuous scrub 0→1 maps wrapper scroll progress → frameIndex (platter→culture)
// Inside tunnel: hero-gradient #1d0d07→#39150f + bg-grain + radial water + canvas
// Panels: left|tunnel|right — desktop at 6%/58% opposite vehicle, mobile centered
// No dashed path, only faint dots + progress bars.
// Generic: pass `frames` (continuous) OR `platterFrames`+`cultureFrames`,
// `poster`, `alt`, `panels` (see ZigZagPanelDef), or custom `children`.
// Card: 250x340 mobile / 380x520 desktop, rounded 24/32, shadow-warm.
// ---------------------------------------------------------------------------

/** A single key defining the invisible zig-zag track (x in vw, y in vh). */
export type ZigZagKey = { p: number; x: number; y: number }

/**
 * 9 keys — 8 segments, alternating left/right, settling center at p=1.
 * Desktop amplitude ±27vw keeps 380px card on-screen with panels at 6%/58%.
 * Copied verbatim from Habesha ZigZagVehicle KEYS.
 */
export const ZIGZAG_KEYS: ZigZagKey[] = [
  { p: 0.0, x: -27, y: -34 },
  { p: 0.125, x: 27, y: -24 },
  { p: 0.25, x: -27, y: -14 },
  { p: 0.375, x: 27, y: -4 },
  { p: 0.5, x: -27, y: 6 },
  { p: 0.625, x: 27, y: 16 },
  { p: 0.75, x: -27, y: 24 },
  { p: 0.875, x: 27, y: 31 },
  { p: 1.0, x: 0, y: 36 },
]

/** Back-compat alias — some Habesha docs refer to KEYS. */
export const KEYS = ZIGZAG_KEYS

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/**
 * Interpolates x/y/rot for a given scroll progress 0–1.
 * Rotation eases in for ±27vw segments then settles (see ZigZagVehicle getPos).
 */
export function getPos(progress: number) {
  const p = Math.min(1, Math.max(0, progress))
  let i = 0
  for (let j = 0; j < ZIGZAG_KEYS.length - 1; j++) {
    if (p >= ZIGZAG_KEYS[j].p && p <= ZIGZAG_KEYS[j + 1].p) {
      i = j
      break
    }
    if (p > ZIGZAG_KEYS[j + 1].p) i = j + 1
  }
  if (i >= ZIGZAG_KEYS.length - 1)
    return { x: ZIGZAG_KEYS[ZIGZAG_KEYS.length - 1].x, y: ZIGZAG_KEYS[ZIGZAG_KEYS.length - 1].y, rot: 0, segT: 1 }
  const a = ZIGZAG_KEYS[i]
  const b = ZIGZAG_KEYS[i + 1]
  const segT = (p - a.p) / (b.p - a.p)
  const x = lerp(a.x, b.x, segT)
  const y = lerp(a.y, b.y, segT)
  const dx = b.x - a.x
  const rot = dx > 5 ? lerp(0, 4, Math.min(1, segT * 2)) : dx < -5 ? lerp(0, -4, Math.min(1, segT * 2)) : 0
  const rotEased = segT > 0.85 ? lerp(rot, 0, (segT - 0.85) / 0.15) : rot
  return { x, y, rot: rotEased, segT }
}

// ---------------------------------------------------------------------------
// Panels — generic left|tunnel|right content.
// Habesha had 9 hard-coded sections (trust / more than a meal / what we serve
// / today's special / signature / guests / reviews / our story / visit).
// Here we make them data-driven via `panels`. Positions are fixed by index
// so height comes from content amount (860vh for 9 panels, ~95vh/panel).
// ---------------------------------------------------------------------------

export type ZigZagPanelDef = {
  /** Optional stable key (defaults to `panel-${index}`). */
  id?: string
  /** Scroll progress anchor 0–1 where this panel is most opaque (e.g. 0.05). */
  anchor: number
  /** Which side on desktop: left (6%), right (58%), center. Mobile always centered. Auto-alternates if omitted. */
  side?: "left" | "right" | "center"
  /** Small mono kicker above title, e.g. "01 — MORE THAN A MEAL". Rendered in var(--spice). */
  kicker?: string
  /** Display title (Fraunces). */
  title?: string
  /** Body copy (muted). */
  description?: string
  /** Fully custom JSX — if provided, kicker/title/description are ignored. */
  content?: React.ReactNode
  /** Extra classes for the outer panel wrapper (width etc). */
  className?: string
}

/** Default layout per panel index — positions copy Habesha's absolute tops + desktop left. */
const PANEL_LAYOUT: Array<{ desktopTop: string; desktopSide: "left" | "right" | "center"; desktopWidth: string; mobileTop: string }> = [
  { desktopTop: "8%", desktopSide: "right", desktopWidth: "w-[360px]", mobileTop: "11%" },
  { desktopTop: "17%", desktopSide: "left", desktopWidth: "w-[380px]", mobileTop: "19.5%" },
  { desktopTop: "27%", desktopSide: "right", desktopWidth: "w-[390px]", mobileTop: "29%" },
  { desktopTop: "37%", desktopSide: "left", desktopWidth: "w-[360px]", mobileTop: "39%" },
  { desktopTop: "48%", desktopSide: "right", desktopWidth: "w-[380px]", mobileTop: "50%" },
  { desktopTop: "59%", desktopSide: "left", desktopWidth: "w-[380px]", mobileTop: "61%" },
  { desktopTop: "69%", desktopSide: "right", desktopWidth: "w-[380px]", mobileTop: "71.5%" },
  { desktopTop: "79.5%", desktopSide: "left", desktopWidth: "w-[380px]", mobileTop: "82%" },
  { desktopTop: "92%", desktopSide: "center", desktopWidth: "w-[440px]", mobileTop: "92.5%" },
]

export type ZigZagProps = {
  /** Unified continuous frames (preferred). Example: 160 × `/frames/frame_0001.webp`. Maps 0→1 linearly. */
  frames?: string[]
  /** Legacy split — Habesha used platter 80 + culture 80. If `frames` absent, these are concatenated. */
  platterFrames?: string[]
  /** Legacy split partner — see above. */
  cultureFrames?: string[]
  /** Poster fallback (shown under canvas, also if no frames yet). Default: first frame or placeholder. */
  poster?: string
  /** Alt for canvas/poster — defaults to "Zig-zag vehicle — continuous scrub". */
  alt?: string
  /** Scroll scrub distance — Habesha elongated to 860vh for 9 panels. Was 580vh for 6. Default 860vh. */
  height?: string
  className?: string
  /** Generic panels — 9 items ideal. If omitted, only the vehicle renders (or use `children`). */
  panels?: ZigZagPanelDef[]
  /** Custom overlay children — alternative to `panels`, rendered absolute inside the sticky viewport. */
  children?: React.ReactNode
  /** Show faint dots on invisible track (default true). */
  showDots?: boolean
  /** Show bottom global progress bar + vehicle bottom bar (default true). */
  showProgress?: boolean
  /** Show "SCROLL — VEHICLE TRAVELS ZIG-ZAG" pill (desktop, default true). */
  showScrollHint?: boolean
  /** Show debug badge at top center: ZIG-ZAG • VEHICLE • 42% • 67/160 (default true). */
  showDebugBadge?: boolean
  /** Hide wrapper top border (default false). */
  hideBorder?: boolean
}

function PanelDefaultContent({ kicker, title, description }: Pick<ZigZagPanelDef, "kicker" | "title" | "description">) {
  if (!kicker && !title && !description) return null
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      {kicker ? <p className="font-mono text-xs font-bold tracking-widest text-[var(--spice)]">{kicker}</p> : null}
      {title ? <h3 className="mt-1 font-display text-[22px] font-semibold leading-[1.05] lg:text-xl">{title}</h3> : null}
      {description ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function ZigZag({
  frames,
  platterFrames,
  cultureFrames,
  poster,
  alt = "Zig-zag vehicle — continuous scrub",
  height = "860vh",
  className,
  panels,
  children,
  showDots = true,
  showProgress = true,
  showScrollHint = true,
  showDebugBadge = true,
  hideBorder = false,
}: ZigZagProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const canvasMobileRef = React.useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = React.useState(0)
  const [isMobile, setIsMobile] = React.useState(false)
  const imagesRef = React.useRef<HTMLImageElement[]>([])

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Unified frames: prefer `frames`, else concat split, else empty.
  const combinedFrames = React.useMemo(() => {
    if (frames?.length) return frames
    const a = platterFrames ?? []
    const b = cultureFrames ?? []
    if (a.length || b.length) return [...a, ...b]
    return [] as string[]
  }, [frames, platterFrames, cultureFrames])

  const resolvedPoster = poster ?? combinedFrames[0] ?? ""

  // Preload frames
  React.useEffect(() => {
    if (!combinedFrames.length) return
    const imgs: HTMLImageElement[] = []
    combinedFrames.forEach((src, i) => {
      const img = new Image()
      img.src = src
      imgs[i] = img
    })
    imagesRef.current = imgs
  }, [combinedFrames])

  // Wrapper scroll → progress 0..1 (rect.top / total as in Habesha)
  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = rect.height - vh
      const p = total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total))
      setProgress(p)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const frameIndex = React.useMemo(
    () => Math.min(combinedFrames.length - 1, Math.max(0, Math.floor(progress * Math.max(1, combinedFrames.length - 1)))),
    [progress, combinedFrames.length]
  )

  const draw = React.useCallback(() => {
    const canvases = [canvasRef.current, canvasMobileRef.current].filter(Boolean) as HTMLCanvasElement[]
    if (!canvases.length) return
    const img = imagesRef.current[frameIndex]
    const ready = img && img.complete && img.naturalWidth > 0 ? img : null
    if (!ready) return
    for (const canvas of canvases) {
      const ctx = canvas.getContext("2d")
      if (!ctx) continue
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      ctx.clearRect(0, 0, w, h)
      const scale = Math.max(w / ready.naturalWidth, h / ready.naturalHeight)
      const nw = ready.naturalWidth * scale
      const nh = ready.naturalHeight * scale
      ctx.drawImage(ready, (w - nw) / 2, (h - nh) / 2, nw, nh)
    }
  }, [frameIndex])

  React.useEffect(() => {
    draw()
    const onResize = () => draw()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [draw])

  React.useEffect(() => {
    const id = setInterval(draw, 66)
    return () => clearInterval(id)
  }, [draw])

  const rawPos = React.useMemo(() => getPos(progress), [progress])
  const pos = React.useMemo(() => {
    if (!isMobile) return rawPos
    // Mobile: reduced amplitude 0.32 keeps 250px card on-screen comfortably.
    return { ...rawPos, x: rawPos.x * 0.32, y: rawPos.y * 0.92 }
  }, [rawPos, isMobile])

  const panelStyle = (anchor: number) => {
    const dist = Math.abs(progress - anchor)
    const visible = Math.max(0, 1 - dist * 8) // window ~0.125 for 9 panels
    const opacity = 0.14 + visible * 0.86
    const yLift = (1 - visible) * 12
    const scale = 0.97 + visible * 0.03
    const filter = visible > 0.6 ? "blur(0px)" : visible > 0.3 ? "blur(0.6px)" : "blur(1.1px)"
    return { opacity, transform: `translateY(${-yLift}px) scale(${scale})`, filter } as React.CSSProperties
  }

  const vehicleLabel = progress < 0.5 ? "PLATTER" : "CULTURE"
  const sideLabel = pos.x < -6 ? "← LEFT" : pos.x > 6 ? "RIGHT →" : "● CENTER"

  return (
    <div
      ref={wrapRef}
      className={cn("relative bg-background", !hideBorder && "border-t", className)}
      style={{ height }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ background: "radial-gradient(ellipse 900px 600px at 50% 40%, var(--spice), transparent 55%)" }}
        />

        {/* Invisible track — only faint dots (dashed line removed per feedback) */}
        {showDots ? (
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {ZIGZAG_KEYS.map((k, i) => {
              const sx = k.x < -5 ? 22 : k.x > 5 ? 78 : 50
              const sy = 7 + (k.p / 1) * 88
              const active = Math.abs(progress - k.p) < 0.055
              return <circle key={i} cx={sx} cy={sy} r={active ? 1.0 : 0.55} fill="var(--spice)" opacity={active ? 0.9 : 0.22} />
            })}
          </svg>
        ) : null}

        {showDebugBadge ? (
          <div className="absolute left-1/2 top-[62px] z-10 -translate-x-1/2 rounded-full bg-foreground px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-background shadow">
            ZIG-ZAG • VEHICLE • {Math.round(progress * 100)}% • {combinedFrames.length ? `${frameIndex + 1}/${combinedFrames.length}` : "—/—"}
          </div>
        ) : null}

        {/* Desktop panels — left/right alternating opposite vehicle */}
        {panels?.length ? (
          <div className="absolute inset-0 hidden lg:block">
            {panels.map((panel, idx) => {
              const layout = PANEL_LAYOUT[idx] ?? PANEL_LAYOUT[PANEL_LAYOUT.length - 1]
              const anchor = panel.anchor
              // side resolution: panel.side overrides layout default; center stays center
              const side = panel.side ?? layout.desktopSide
              const leftClass =
                side === "center"
                  ? "left-1/2 -translate-x-1/2 -translate-y-1/2"
                  : side === "left"
                    ? "left-[6%] -translate-y-1/2"
                    : "left-[58%] -translate-y-1/2"
              const widthClass = panel.className?.includes("w-[") ? "" : layout.desktopWidth
              return (
                <div
                  key={panel.id ?? `panel-${idx}`}
                  className={cn("absolute", leftClass, widthClass, panel.className)}
                  style={{ top: layout.desktopTop, ...panelStyle(anchor) }}
                >
                  {panel.content ?? (
                    <PanelDefaultContent kicker={panel.kicker} title={panel.title} description={panel.description} />
                  )}
                </div>
              )
            })}
          </div>
        ) : null}

        {/* Mobile panels — always centered */}
        {panels?.length ? (
          <div className="absolute inset-0 lg:hidden">
            {panels.map((panel, idx) => {
              const layout = PANEL_LAYOUT[idx] ?? PANEL_LAYOUT[PANEL_LAYOUT.length - 1]
              return (
                <div
                  key={panel.id ?? `m-panel-${idx}`}
                  className="absolute left-1/2 w-[92%] max-w-[360px] -translate-x-1/2 -translate-y-1/2"
                  style={{ top: layout.mobileTop, ...panelStyle(panel.anchor) }}
                >
                  <div className="rounded-xl bg-card/95 p-3 shadow ring-1 ring-border backdrop-blur">
                    {panel.content ?? (
                      <>
                        {panel.kicker ? (
                          <p className="font-mono text-[10px] font-bold tracking-widest text-[var(--spice)]">{panel.kicker}</p>
                        ) : null}
                        {panel.title ? (
                          <p className="font-display text-sm font-bold leading-tight">{panel.title}</p>
                        ) : null}
                        {panel.description ? (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{panel.description}</p>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}

        {/* Custom children overlay (alternative to panels) — rendered on both breakpoints */}
        {children ? <div className="absolute inset-0 pointer-events-none [&>*]:pointer-events-auto">{children}</div> : null}

        {/* Vehicle card — water inside tunnel */}
        <div
          className="absolute left-1/2 top-1/2 z-20 will-change-transform"
          style={{
            transform: `translate(-50%, -50%) translate3d(${pos.x}vw, ${pos.y}vh, 0) rotate(${pos.rot}deg)`,
            transition: "transform 0.06s linear",
          }}
        >
          <div className="relative h-[340px] w-[250px] overflow-hidden rounded-[24px] bg-[#1d0d07] shadow-warm ring-1 ring-black/15 lg:h-[520px] lg:w-[380px] lg:rounded-[32px]">
            {/* water layers */}
            <div className="absolute inset-0 hero-gradient" />
            <div className="absolute inset-0 bg-grain opacity-30" />
            <div className="absolute inset-0 opacity-[0.08]" style={{ background: "radial-gradient(ellipse at center, #3a9ad9 0%, transparent 68%)" }} />
            {/* poster fallback */}
            {resolvedPoster ? (
              <img src={resolvedPoster} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />
            ) : null}
            {/* scrubbable canvases — desktop + mobile separate for DPR correctness */}
            <canvas
              ref={canvasRef}
              aria-label={alt}
              role="img"
              className="absolute inset-0 hidden h-full w-full lg:block"
              style={{ width: "100%", height: "100%" }}
            />
            <canvas ref={canvasMobileRef} aria-label={`${alt} mobile`} className="absolute inset-0 block h-full w-full lg:hidden" />
            {/* water sheen */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.05] to-white/[0.09] mix-blend-overlay" />
            <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20" />
            {showProgress ? (
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/12">
                <div className="h-full bg-[var(--spice)]" style={{ width: `${progress * 100}%`, transition: "width 0.06s linear" }} />
              </div>
            ) : null}
            <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white backdrop-blur ring-1 ring-white/15">
              VEHICLE • {combinedFrames.length ? `${vehicleLabel} • ${Math.round(progress * combinedFrames.length)}/${combinedFrames.length}` : sideLabel}
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-foreground shadow">
                {sideLabel} • {Math.round(progress * 100)}%
              </span>
              <span className="hidden rounded-full bg-[var(--spice)] px-2.5 py-1 text-[10px] font-black tracking-widest text-white lg:inline">
                ZIG-ZAG
              </span>
            </div>
          </div>
          <div className="mx-auto mt-2 h-2 w-[62%] rounded-full bg-black/15 blur-[6px] lg:w-[74%]" aria-hidden />
          {/* mobile dots */}
          <div className="mt-1.5 flex justify-center gap-1 lg:hidden" aria-hidden>
            {PANEL_LAYOUT.map((_, i) => {
              const a = panels?.[i]?.anchor ?? ZIGZAG_KEYS[Math.min(i, ZIGZAG_KEYS.length - 1)]?.p ?? i / 8
              return (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: Math.abs(progress - a) < 0.07 ? "var(--spice)" : "rgba(0,0,0,0.18)" }}
                />
              )
            })}
          </div>
        </div>

        {showProgress ? (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5">
            <div className="h-full bg-[var(--spice)]/70" style={{ width: `${progress * 100}%` }} />
          </div>
        ) : null}

        {showScrollHint ? (
          <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-xs shadow ring-1 ring-border backdrop-blur lg:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--spice)]" />
            <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground">SCROLL — VEHICLE TRAVELS ZIG-ZAG</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Back-compat: Habesha exported `ZigZagVehicle`. New canonical name is `ZigZag`. */
export const ZigZagVehicle = ZigZag
