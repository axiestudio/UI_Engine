import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { TextShimmer } from "@/components/primitives/text-shimmer"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type BlogPost = {
  id?: string
  title: string
  excerpt?: string
  /** ISO date string or any display string; ISO is formatted to "Mon D, YYYY". */
  date: string
  readMinutes?: number
  image?: string
  imageAlt?: string
  tag?: string
  href: string
  author?: string
}

export type BlogGridProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  posts: BlogPost[]
  /** Highlight the first post as a wide lead card. Default true when >=3 posts. */
  lead?: boolean
  /** Shimmer the (string) post titles on hover. Default false. */
  shimmerTitles?: boolean
  /** "View all" link under the grid. */
  moreLink?: { label: string; href: string }
  className?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d)
  if (!m) return d
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function PostCard({ post, lead, shimmer }: { post: BlogPost; lead?: boolean; shimmer?: boolean }) {
  const title = (
    <h3 className={cn("font-display font-bold leading-snug tracking-tight group-hover:underline decoration-2 underline-offset-4", lead ? "text-2xl sm:text-[28px] max-w-xl" : "text-lg")}>
      {shimmer ? <TextShimmer className="text-inherit">{post.title}</TextShimmer> : post.title}
    </h3>
  )
  const meta = (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      <span>{formatDate(post.date)}</span>
      {post.readMinutes !== undefined && <span aria-hidden>·</span>}
      {post.readMinutes !== undefined && <span>{post.readMinutes} min read</span>}
      {post.author && <span aria-hidden>·</span>}
      {post.author && <span>{post.author}</span>}
    </p>
  )
  if (post.image) {
    return (
      <a id={post.id} href={post.href} className={cn("group flex scroll-mt-24 flex-col overflow-hidden rounded-[24px] border bg-card shadow-sm transition-shadow hover:shadow-md", lead && "sm:col-span-2 sm:flex-row sm:items-stretch")}>
        <div className={cn("relative shrink-0 overflow-hidden", lead ? "aspect-[16/9] sm:aspect-auto sm:w-[52%]" : "aspect-[16/10]")}>
          <img src={post.image} alt={post.imageAlt ?? post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        </div>
        <div className={cn("flex flex-1 flex-col justify-center p-5", lead ? "sm:p-9" : "")}>
          {post.tag && <span className="mb-3 inline-flex w-fit items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{post.tag}</span>}
          {title}
          {post.excerpt && <p className={cn("mt-2 font-medium leading-relaxed text-muted-foreground", lead ? "text-[15px] line-clamp-2 sm:max-w-[52ch]" : "text-sm line-clamp-2 sm:max-w-[56ch]")}>{post.excerpt}</p>}
          {meta}
        </div>
      </a>
    )
  }
  return (
    <a id={post.id} href={post.href} className="group flex flex-col rounded-[24px] border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {post.tag && <span className="mb-3 inline-flex w-fit items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{post.tag}</span>}
      {title}
      {post.excerpt && <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-muted-foreground line-clamp-3">{post.excerpt}</p>}
      {meta}
      <ArrowUpRight className="mt-3 h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
    </a>
  )
}

// ── BlogGrid ─────────────────────────────────────────────────────────────────

export function BlogGrid({ eyebrow, title, subtitle, posts, lead, shimmerTitles = false, moreLink, className }: BlogGridProps) {
  if (!posts.length) return null
  const useLead = lead ?? posts.length >= 3
  const gridPosts = useLead ? posts.slice(1) : posts
  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title ?? "Journal"}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
          <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
              {title && <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
              {subtitle && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
            </div>
            {moreLink && (
              <a href={moreLink.href} className="inline-flex items-center gap-1 text-sm font-bold underline-offset-4 hover:underline">
                {moreLink.label} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </header>

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {useLead && <PostCard key={posts[0].id ?? posts[0].title} post={posts[0]} lead shimmer={shimmerTitles} />}
            {gridPosts.map((p, i) => (
              <InView key={p.id ?? p.title} as="div" variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-30px" }} className="h-full">
                <PostCard post={p} shimmer={shimmerTitles} />
              </InView>
            ))}
          </div>
        </InView>
      </div>
    </section>
  )
}
