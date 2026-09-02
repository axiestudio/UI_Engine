import * as React from "react"
import { Mail, Globe} from "lucide-react"
import { Tilt } from "@/components/primitives/tilt"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type TeamMember = {
  id?: string
  name: string
  role: string
  /** Remote avatar URL. An initials block is used when absent or broken. */
  avatarSrc?: string
  initials?: string
  bio?: string
  /** Small credential chips over the image, e.g. ["Cert. Massör", "25 år"]. */
  tags?: string[]
  links?: { label: string; href: string; icon?: React.ElementType }[]
}

export type TeamProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  members?: TeamMember[]
  /** Columns on desktop — clamped to the number of members. Default 3. */
  columns?: 2 | 3 | 4
  /** Subtle 3D tilt on hover. Default true (a no-op for touch + reduced motion is inherent: no JS animation there). */
  tilt?: boolean
  /** Render member bios inline. Default false. */
  showBios?: boolean
  className?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function Avatar({ m }: { m: TeamMember }) {
  const [failed, setFailed] = React.useState(false)
  if (m.avatarSrc && !failed) {
    return <img src={m.avatarSrc} alt={m.name} onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
  }
  return (
    <div role="img" aria-label={m.name} className="flex h-full w-full items-center justify-center bg-muted font-display text-5xl font-bold text-muted-foreground">
      {m.initials ?? initialsOf(m.name)}
    </div>
  )
}

function MemberCard({ m, tilt = true, showBios = false }: { m: TeamMember; tilt?: boolean; showBios?: boolean }) {
  const card = (
    <div id={m.id} className="group flex h-full scroll-mt-24 flex-col overflow-hidden rounded-[24px] border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Avatar m={m} />
        {m.tags && m.tags.length > 0 && (
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
            {m.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-background/90 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-foreground shadow-sm backdrop-blur">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-tight tracking-tight">{m.name}</h3>
        <p className="mt-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{m.role}</p>
        {showBios && m.bio && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{m.bio}</p>}
        {m.links && m.links.length > 0 && (
          <div className={cn("mt-4 flex items-center gap-1.5", showBios ? "" : "mt-auto pt-4")}>
            {m.links.map((l) => {
              const Icon = l.icon ?? (l.href.startsWith("mailto:") ? Mail : undefined)
              return Icon ? (
                <a
                  key={l.label}
                  href={l.href}
                  aria-label={`${l.label} — ${m.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ) : (
                <a key={l.label} href={l.href} className="text-xs font-bold underline-offset-4 hover:underline">
                  {l.label}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
  if (!tilt) return card
  return (
    <Tilt rotationFactor={4} className="h-full">
      {card}
    </Tilt>
  )
}

// ── Team ─────────────────────────────────────────────────────────────────────


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_TEAM_MEMBERS = [ { name: "Astrid L.", role: "Founder · Physio", tags: ["25 yrs", "Cert."], bio: "Treats chronic neck and back tension." }, { name: "Omar K.", role: "Deep-tissue specialist", tags: ["Evenings"], bio: "Sports recovery and posture work." }, { name: "Elin S.", role: "Head of reception", tags: ["SV", "EN", "AR"], bio: "Books, reschedules and remembers your name." }, { name: "Noa B.", role: "Massage therapist", links: [{ label: "Email", href: "mailto:hei@example.com" }, { label: "Website", href: "#", icon: Globe }] }, ]

export function Team({ eyebrow = "The people", title = "Meet the team", subtitle, members = DEMO_TEAM_MEMBERS, columns = 3, tilt = true, showBios = false, className }: TeamProps) {
  if (!members.length) return null
  const cols = Math.min(columns, members.length)

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
              {subtitle && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
            </div>
            <p className="font-mono text-xs font-bold text-muted-foreground">{String(members.length).padStart(2, "0")}</p>
          </div>

          <div className={cn("grid gap-5 sm:grid-cols-2", cols === 3 && "lg:grid-cols-3", cols === 4 && "lg:grid-cols-4", cols === 2 && "lg:max-w-[880px]")}>
            {members.map((m, i) => (
              <InView
                key={m.id ?? m.name}
                as="div"
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.35), ease: [0.16, 1, 0.3, 1] }}
                viewOptions={{ once: true, margin: "-40px" }}
              >
                <MemberCard m={m} tilt={tilt} showBios={showBios} />
              </InView>
            ))}
          </div>
        </InView>
      </div>
    </section>
  )
}
