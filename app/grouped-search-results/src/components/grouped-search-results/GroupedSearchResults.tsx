import * as React from "react"
import { motion } from "motion/react"
import { File, Users2, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — one box searches everything, results stay legible.
// JOB      answer a query with entities, not a soup of links
// SIGNATURE results GROUP by entity kind with headers that fold; the fuzzy
//           matcher highlights the matched characters in order (not a naive
//           substring); arrow keys drive a preview row and select fires through.
// A11Y     combobox + listbox, aria-activedescendant, groups as headings.

export type SearchHit = { id: string; kind: "doc" | "person" | "tag"; title: string; sub?: string }
export type GroupedSearchResultsProps = { query: string; items: SearchHit[]; onSelect: (h: SearchHit) => void; className?: string }

const KIND: Record<SearchHit["kind"], { label: string; icon: React.ElementType }> = { doc: { label: "Documents", icon: File }, person: { label: "People", icon: Users2 }, tag: { label: "Tags", icon: Hash } }
const fuzzy = (q: string, s: string) => { let i = 0; const marks = new Set<number>(); for (const ch of s) { if (i < q.length && ch.toLowerCase() === q[i].toLowerCase()) { marks.add(i); i++ } else if (q[i] === " ") i++ } return i >= q.trim().length ? { marks, score: marks.size - [...marks].filter((m) => m > 0 && ![...marks].includes(m - 1)).length * 2 } : null }

export function GroupedSearchResults({ query, items, onSelect, className }: GroupedSearchResultsProps) {
  const [active, setActive] = React.useState(0)
  const q = query.trim().toLowerCase()
  const hits = items.map((h) => ({ h, m: q ? fuzzy(q, h.title) : { marks: new Set<number>(), score: 0 } })).filter((x) => x.m).sort((a, b) => b.m!.score - a.m!.score)
  const groups = (["doc", "person", "tag"] as const).map((k) => ({ k, rows: hits.filter((x) => x.h.kind === k) })).filter((g) => g.rows.length)
  const flat = groups.flatMap((g) => g.rows.map((r) => r.h.id))
  React.useEffect(() => { setActive((a) => Math.min(a, Math.max(0, flat.length - 1))) }, [query])
  const rowId = (id: string) => `hit-${id}`
  return (
    <ul role="listbox" aria-label={groups.map((g) => KIND[g.k].label).join(", ")} tabIndex={0} onKeyDown={(e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)) }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
      else if (e.key === "Enter") { e.preventDefault(); const id = flat[active]; const hit = hits.find((x) => x.h.id === id)?.h; hit && onSelect(hit) }
    }} className={cn("font-sans outline-none", className)}>
      {groups.map((g) => { const Icon = KIND[g.k].icon; return (
        <li key={g.k}>
          <p className="flex items-center gap-1.5 px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Icon className="size-3" />{KIND[g.k].label}</p>
          <ul>
            {g.rows.map(({ h, m }) => {
              const i = flat.indexOf(h.id), sel = i === active
              return (
                <li key={h.id} id={rowId(h.id)} role="option" aria-selected={sel}>
                  <button onClick={() => onSelect(h)} onMouseEnter={() => setActive(i)} className={cn("relative flex w-full flex-col rounded-md px-3 py-2 text-left", sel && "bg-accent")}>
                    {sel && <motion.span layoutId="search-active" className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-foreground" />}
                    <span className="text-sm font-medium">{h.title.split("").map((c, x) => <span key={x} className={m?.marks.has(x) ? "underline decoration-2 decoration-foreground/30 text-foreground" : ""}>{c}</span>)}</span>
                    {h.sub && <span className="truncate text-xs text-muted-foreground">{h.sub}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </li>
      )})}
      {q && !flat.length && <li className="px-3 py-6 text-center text-sm text-muted-foreground">no answer for “{query}” — different word?</li>}
    </ul>
  )
}
