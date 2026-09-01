import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Check, Copy, Pencil, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { MessageActions, MessageAction } from "@/components/ai-elements/message"

// ═══ APP-PRIMARY — every generated answer needs an afterlife.
// JOB      let the reader act on an answer without feeling trapped by it
// ROUND 2  composed on the shadcn chat primitive (AI Elements MessageActions /
//           MessageAction — real buttons + tooltip + sr-only labels per bubble action)
// SIGNATURE the bar appears as the stream ENDS (rise + settle, not a pop-in);
//           thumbs morph the hovered icon toward the chosen side; regenerate
//           spins the button once and announces a "take 2"; copy ✓ rides home.
// A11Y     MessageAction keeps a11y (aria-label, sr-only text); aria-pressed on rating.

export type AiAnswerToolbarProps = { tokensUsed?: number; onCopy?: () => Promise<void> | void; onRegenerate?: () => void; onThumbs?: (v: "up" | "down") => void; rating?: "up" | "down" | null; onEdit?: () => void; streaming?: boolean; className?: string }

export function AiAnswerToolbar({ tokensUsed, onCopy, onRegenerate, onThumbs, rating, onEdit, streaming, className }: AiAnswerToolbarProps) {
  const [copied, setCopied] = React.useState(false)
  const [spin, setSpin] = React.useState(0)
  const [announce, setAnnounce] = React.useState("")
  React.useEffect(() => { if (rating) setSpin(0) }, [rating])
  return (
    <AnimatePresence>
      {!streaming && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={cn("flex w-full items-center gap-1 pt-2 font-sans", className)}
        >
          <MessageActions>
            <MessageAction
              tooltip="Good answer"
              aria-pressed={rating === "up"}
              onClick={() => { onThumbs?.("up"); setAnnounce(rating === "up" ? "Rating cleared." : "Marked as a good answer.") }}
              className={cn(rating === "up" && "text-[hsl(var(--ok))]")}
            >
              <motion.span animate={rating === "up" ? { scale: [1, 1.3, 1] } : { x: 0 }} whileHover={{ x: -2 }}><ThumbsUp /></motion.span>
            </MessageAction>
            <MessageAction
              tooltip="Bad answer"
              aria-pressed={rating === "down"}
              onClick={() => { onThumbs?.("down"); setAnnounce(rating === "down" ? "Rating cleared." : "Marked as a bad answer.") }}
              className={cn(rating === "down" && "text-[hsl(var(--err))]")}
            >
              <motion.span animate={rating === "down" ? { y: [0, 3, 0] } : {}}><ThumbsDown /></motion.span>
            </MessageAction>
            {onEdit && (
              <MessageAction tooltip="Edit answer" onClick={() => { onEdit(); setAnnounce("Edit opened.") }}>
                <Pencil />
              </MessageAction>
            )}
            {onCopy && (
              <MessageAction
                tooltip={copied ? "Copied" : "Copy answer"}
                onClick={async () => { await onCopy(); setCopied(true); setAnnounce("Answer copied to clipboard."); setTimeout(() => setCopied(false), 1600) }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? <motion.span key="c" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.4 }}><Check className="text-[hsl(var(--ok))]" /></motion.span> : <motion.span key="p" initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.4 }}><Copy /></motion.span>}
                </AnimatePresence>
              </MessageAction>
            )}
            {onRegenerate && (
              <MessageAction
                tooltip="Regenerate answer"
                onClick={() => { setSpin((s) => s + 1); onRegenerate(); setAnnounce("Regenerating — take 2 coming.") }}
              >
                <motion.span animate={{ rotate: spin * 360 }} transition={{ duration: 0.7 }}><RefreshCw /></motion.span>
              </MessageAction>
            )}
          </MessageActions>
          {tokensUsed !== undefined && <span className="ml-auto font-mono text-[11px] text-muted-foreground">{tokensUsed} tokens · 1.2s · gpt-class</span>}
          <p className="sr-only" aria-live="polite">{announce}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
