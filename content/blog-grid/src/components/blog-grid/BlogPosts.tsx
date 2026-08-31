import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
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
    </SectionShell>
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
