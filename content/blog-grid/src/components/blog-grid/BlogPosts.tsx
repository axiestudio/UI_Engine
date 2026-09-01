import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Blog grid — article cards with category, date, read time.
// ═══ EMOTION     A journal worth browsing.
// ═══ SIGNATURE   A 3-col article grid with a featured first card.

export type BlogPost = { id: string; title: string; category?: string; date?: string; read?: string; image?: string; excerpt?: string }

export type BlogPostsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  posts: BlogPost[]
  tone?: "paper" | "ink"
  className?: string
}

export function BlogPosts({ eyebrow = "JOURNAL", title = "Notes & methods.", subtitle = "Short reads on design and motion.", posts, tone = "paper", className }: BlogPostsProps) {
  const ink = tone === "ink"
  const [featured, ...rest] = posts
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {featured && (
          <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <a href="#" className="group block">
              <div className="img-hover-wash aspect-[16/10] overflow-hidden rounded-xl border bg-muted">
                {featured.image ? <img src={featured.image} alt={featured.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
              <div className="mt-4">
                <Meta post={featured} ink={ink} />
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight group-hover:underline">{featured.title}</h3>
                {featured.excerpt && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{featured.excerpt}</p>}
              </div>
            </a>
          </InView>
        )}
        <div className="grid gap-4">
          {rest.map((p, i) => (
            <InView key={p.id} once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
              <a href="#" className={cn("group flex gap-4 rounded-xl border p-3", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
                <div className="img-hover-wash aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {p.image ? <img src={p.image} alt={p.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Meta post={p} ink={ink} />
                  <h3 className="mt-1 font-display text-lg font-bold leading-tight group-hover:underline">{p.title}</h3>
                </div>
              </a>
            </InView>
          ))}
        </div>
      </div>
    
  </div>
</section>
  )
}

function Meta({ post, ink }: { post: BlogPost; ink: boolean }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>
      {post.category && <span>{post.category}</span>}
      {post.category && post.date && <span aria-hidden>·</span>}
      {post.date && <span>{post.date}</span>}
      {post.read && <span className="inline-flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{post.read}</span>}
    </p>
  )
}
