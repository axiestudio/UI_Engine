import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { X } from "lucide-react"
import {
  FloatingPortal,
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from "@floating-ui/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — emails, tags, scopes: lists typed, not picked.
// JOB      enter comma/space-separated values as managed tokens
// SIGNATURE paste of "a, b, c; d" splits & dedups into flying pills; backspace
//           on empty arms a red delete (second press removes — the two-stage
//           guard everyone expects but nobody builds); dupes shake, not add.
// POSITIONING optional autocomplete suggestion list is a useFloating listbox
//           welded to the input: [offset → flip → shift(8) → hide],
//           useRole('listbox') + useListNavigation (roving focus) + autoUpdate.
// A11Y     tokens are list items with remove buttons; input labelled +
//          combobox semantics when suggestions show; live region counts
//          total/dupes.

export type TokenInputProps = { value: string[]; onChange: (v: string[]) => void; placeholder?: string; validate?: (t: string) => string | null; suggestions?: string[]; label?: string; className?: string }

export function TokenInput({ value, onChange, placeholder = "Type, paste, or press Enter…", validate, suggestions, label = "Tokens", className }: TokenInputProps) {
  const [text, setText] = React.useState("")
  const [shake, setShake] = React.useState<string | null>(null)
  const [armed, setArmed] = React.useState(false)
  const [msg, setMsg] = React.useState("")
  const ref = React.useRef<HTMLInputElement>(null)
  const [listOpen, setListOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const listRef = React.useRef<Array<HTMLElement | null>>([])
  const matches = React.useMemo(() => (suggestions ?? []).filter((s) => s.toLowerCase().includes(text.trim().toLowerCase()) && text.trim().length > 0 && !value.some((t) => t.toLowerCase() === s.toLowerCase())).slice(0, 6), [suggestions, text, value])

  const { refs, floatingStyles, context } = useFloating({
    open: listOpen && matches.length > 0,
    onOpenChange: setListOpen,
    placement: "bottom-start",
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 }), hide()],
    whileElementsMounted: autoUpdate,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "listbox" })
  const listNav = useListNavigation(context, { listRef, activeIndex, onNavigate: setActiveIndex, loop: true })
  // useTypeahead matches by string; indices align with the option elements
  const labelsRef = React.useRef<Array<string | null>>([])
  labelsRef.current = matches.map((m) => m)
  const typeahead = useTypeahead(context, { listRef: labelsRef, activeIndex, onMatch: setActiveIndex })
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([dismiss, role, listNav, typeahead])

  const add = (raw: string) => {
    const parts = raw.split(/[,\n;]+\s*/).map((t) => t.trim()).filter(Boolean)
    const next = [...value]; let dupes = 0; let rejected = 0
    for (const p of parts) {
      if (validate) { const err = validate(p.toLowerCase()); if (err) { rejected++; setMsg(err); continue } }
      const k = p.toLowerCase()
      if (next.some((t) => t.toLowerCase() === k)) { dupes++; setShake(k); setTimeout(() => setShake(null), 420); continue }
      next.push(p)
    }
    if (next.length !== value.length) onChange(next)
    else if (dupes) setMsg(`${dupes} duplicate${dupes > 1 ? "s" : ""} skipped`)
    if (!rejected) setMsg("")
    setText(""); setArmed(false); setListOpen(false); setActiveIndex(null)
  }

  const pickSuggestion = (s: string) => { add(s) }

  return (
    <div className={cn("relative isolate w-full overflow-hidden font-sans", className)} onClick={() => ref.current?.focus()}>
      <MotionConfig reducedMotion="user">
      <div className={cn("flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 cursor-text transition-shadow focus-within:ring-2 focus-within:ring-[hsl(var(--app-focus))]")}>
        <AnimatePresence initial={false}>
          {value.map((t) => (
            <motion.span layout key={t} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: shake === t.toLowerCase() ? [1, 1.06, 0.96, 1.03, 1] : 1, boxShadow: shake === t.toLowerCase() ? "0 0 0 2px hsl(var(--err))" : "0 0 0 0 transparent" }} exit={{ scale: 0.8, opacity: 0 }} transition={{ layout: { duration: 0.18 }, opacity: { duration: shake === t.toLowerCase() ? 0.4 : 0.15 } }} className="flex items-center gap-1 rounded-full bg-accent py-0.5 pl-2.5 pr-1 text-[12px] font-bold text-accent-foreground">
              {t}
              <Button type="button" variant="ghost" aria-label={`Remove ${t}`} onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== t)) }} className="grid size-4 place-items-center rounded-full hover:bg-primary-foreground/20"><X className="size-3" /></Button>
            </motion.span>
          ))}
        </AnimatePresence>
        <Input ref={useMergeRefs([ref, refs.setReference])} aria-label={label} role="combobox" aria-expanded={listOpen && matches.length > 0} aria-autocomplete="list" aria-controls="token-input-listbox" value={text} {...getReferenceProps({ onChange: (e: React.ChangeEvent<HTMLElement>) => { const v = (e.target as HTMLInputElement).value; setText(v); setArmed(false); setListOpen(v.trim().length > 0) }, onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === "Enter" && listOpen && matches.length > 0 && activeIndex != null) { e.preventDefault(); pickSuggestion(matches[activeIndex]); ref.current?.focus(); return }
          if ((e.key === "Enter" || e.key === " " || e.key === ",") && text.trim()) { e.preventDefault(); add(text) }
          else if (e.key === "Backspace" && !text && value.length) {
            if (armed) onChange(value.slice(0, -1))
            else { setArmed(true); setTimeout(() => setArmed(false), 1400) }
          } else setArmed(false)
        }, onPaste: (e: React.ClipboardEvent<HTMLElement>) => { const data = e.clipboardData.getData("text"); if (/[,\n;]/.test(data)) { e.preventDefault(); add(data + text) } } })} placeholder={value.length && !text ? "" : placeholder} className="h-7 min-w-[12ch] flex-1 bg-transparent text-sm outline-none" />
        {armed && <span aria-hidden className="rounded-sm bg-[hsl(var(--err))]/10 px-1.5 text-[11px] font-medium text-[hsl(var(--err))]">again to delete “{value[value.length - 1]}”</span>}
          
    </div>
      <p aria-live="polite" className="sr-only">{msg} {value.length} token{value.length === 1 ? "" : "s"} total</p>
      <FloatingPortal>
        {listOpen && matches.length > 0 && (
          <ul
            id="token-input-listbox"
            ref={refs.setFloating}
            style={floatingStyles}
            aria-label={`${label} suggestions`}
            {...getFloatingProps()}
            className="absolute z-50 w-56 rounded-lg border border-border/70 bg-popover p-1 text-popover-foreground shadow-xl outline-none"
          >
            {matches.map((s, i) => {
              const q = text.trim().toLowerCase()
              const at = s.toLowerCase().indexOf(q)
              return (
                <li
                  key={s}
                  role="option"
                  aria-selected={i === activeIndex}
                  tabIndex={-1}
                  ref={(el) => { listRef.current[i] = el }}
                  {...getItemProps({ onClick: () => { pickSuggestion(s); ref.current?.focus() } })}
                  className={cn("flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none", i === activeIndex && "bg-accent text-accent-foreground")}
                >
                  <span>{s.slice(0, at)}<b className="font-bold">{s.slice(at, at + q.length)}</b>{s.slice(at + q.length)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </FloatingPortal>
          </MotionConfig>
    </div>
  )
}
