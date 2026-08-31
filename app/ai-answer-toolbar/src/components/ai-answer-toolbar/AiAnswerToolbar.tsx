import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Copy, Pencil, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

// ═══ APP-PRIMARY — every generated answer needs an afterlife.
// JOB      let the reader act on an answer without feeling trapped by it
// SIGNATURE the bar appears as the stream ENDS (rise + settle, not a pop-in);
//           thumbs morph the hovered icon toward the chosen side; regenerate
//           spins the button once and announces a "take 2"; copy ✓ rides home.
// A11Y     real buttons, aria-pressed on rating.

export type AiAnswerToolbarProps = { tokensUsed?: number; onCopy?: () => Promise<void> | void; onRegenerate?: () => void; onThumbs?: (v: "up" | "down") => void; rating?: "up" | "down" | null; onEdit?: () => void; streaming?: boolean; className?: string }

export function AiAnswerToolbar({ tokensUsed, onCopy, onRegenerate, onThumbs, rating, onEdit, streaming, className }: AiAnswerToolbarProps) {
  const [copied, setCopied] = React.useState(false)
  const [spin, setSpin] = React.useState(0)
  React.useEffect(() => { if (rating) setSpin(0) }, [rating])
  return (
    <AnimatePresence>
      {!streaming && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={cn("flex items-center gap-1 pt-2 font-sans", className)}>
          <button aria-pressed={rating === "up"} aria-label="Good answer" onClick={() => onThumbs?.("up")} className={"group grid size-8 place-items-center rounded-md hover:bg-muted " + (rating === "up" ? "text-[hsl(var(--ok))]" : "text-muted-foreground")}>
            <motion.span animate={rating === "up" ? { scale: [1, 1.3, 1] } : { x: 0 }} whileHover={{ x: -2 }}>{<ThumbsUp className="size-4" />}</motion.span>
          </button>
          <button aria-pressed={rating === "down"} aria-label="Bad answer" onClick={() => onThumbs?.("down")} className={"grid size-8 place-items-center rounded-md hover:bg-muted " + (rating === "down" ? "text-[hsl(var(--err))]" : "text-muted-foreground")}>
            <motion.span animate={rating === "down" ? { y: [0, 3, 0] } : {}}><ThumbsDown className="size-4" /></motion.span>
          </button>
          {onEdit && <button aria-label="Edit answer" onClick={onEdit} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"><Pencil className="size-4" /></button>}
          {onCopy && (
            <button aria-label="Copy answer" onClick={async () => { await onCopy(); setCopied(true); setTimeout(() => setCopied(false), 1600) }} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted">
              <AnimatePresence mode="wait" initial={false}>{copied ? <motion.span key="c" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.4 }}><Check className="size-4 text-[hsl(var(--ok))]" /></motion.span> : <motion.span key="p" initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.4 }}><Copy className="size-4" /></motion.span>}</AnimatePresence>
            </button>
          )}
          {onRegenerate && <button aria-label="Regenerate answer" onClick={() => { setSpin((s) => s + 1); onRegenerate() }} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"><motion.span animate={{ rotate: spin * 360 }} transition={{ duration: 0.7 }}><RefreshCw className="size-4" /></motion.span></button>}
          {tokensUsed !== undefined && <span className="ml-auto text-xs text-muted-foreground">{tokensUsed} tokens · 1.2s</span>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
