/** Generated: ambient shims reused by wave-4 composites (single source: engine/src/presets.d.ts). Re-run the wave-4 shim exporter after editing presets.d.ts. */
import * as React from "react"

declare module "password-meter" {
  import * as React from "react"
  export type PasswordMeterProps = { value: string; onChange: (v: string) => void; breached?: boolean; checking?: boolean; onScore?: (s: number) => void; placeholder?: string; className?: string }
  export const PasswordMeter: React.FC<PasswordMeterProps>
}

declare module "smart-skeleton" {
  import * as React from "react"
  export type SmartSkeletonProps = { loading: boolean; lines?: number; avatar?: boolean; slowLabel?: string; slowAfterMs?: number; children: React.ReactNode; className?: string }
  export const SmartSkeleton: React.FC<SmartSkeletonProps>
}

declare module "permission-matrix" {
  import * as React from "react"
  export type TriState = "deny" | "ask" | "allow"
  export type PermissionMatrixProps = { perms: string[]; roles: string[]; value: Record<string, Record<string, TriState>>; onSet?: (row: string, col: string, v: TriState) => void; readOnly?: boolean; className?: string }
  export const PermissionMatrix: React.FC<PermissionMatrixProps>
}

declare module "annotation-pin-layer" {
  import * as React from "react"
  export type Pin = { id: string; x: number; y: number; author: string; text: string }
  export type AnnotationPinLayerProps = { canvas: React.ReactNode; pins: Pin[]; onAddPin?: (p: { x: number; y: number }) => void; onRemove?: (id: string) => void; author?: string; className?: string }
  export const AnnotationPinLayer: React.FC<AnnotationPinLayerProps>
}

declare module "ai-change-review" {
  import * as React from "react"
  export type Hunk = { id: string; file: string; title: string; from: string; to: string }
  export type AiChangeReviewProps = { hunks: Hunk[]; onAccept: (id: string) => void; onReject?: (id: string) => void; className?: string }
  export const AiChangeReview: React.FC<AiChangeReviewProps>
}

declare module "boarding-pass-gate" {
  import * as React from "react"
  export type BoardingPassData = { holder: string; from: string; to: string; when: string; seat?: string; code: string; validUntil?: string; stamp?: string }
  export type BoardingPassProps = { eyebrow?: string; title?: React.ReactNode; pass: BoardingPassData; cta?: { label: string; href?: string; onClick?: () => void }; className?: string }
  export const BoardingPass: React.FC<BoardingPassProps>
}

declare module "activity-heatmap" {
  import * as React from "react"
  export type HeatCell = { count: number }
  export type ActivityHeatmapProps = { cells: HeatCell[]; levelOf?: (c: number) => 0 | 1 | 2 | 3 | 4; weeks?: number; className?: string }
  export const ActivityHeatmap: React.FC<ActivityHeatmapProps>
}

declare module "tabs-overflow-strip" {
  import * as React from "react"
  export type AppTab = { id: string; label: string; dirty?: boolean; pinned?: boolean }
  export type TabsOverflowStripProps = { tabs: AppTab[]; value: string; onChange: (id: string) => void; onClose?: (id: string) => void; onPin?: (id: string) => void; className?: string }
  export const TabsOverflowStrip: React.FC<TabsOverflowStripProps>
}

declare module "sparkline-cell" {
  import * as React from "react"
  export type SparklineCellProps = { values: number[]; labels?: string[]; format?: (v: number) => string; width?: number; height?: number; className?: string }
  export const SparklineCell: React.FC<SparklineCellProps>
}

declare module "filter-token-builder" {
  import * as React from "react"
  export type FilterToken = { field: string; op: "=" | "≠" | ":"; value: string }
  export type FilterTokenBuilderProps = { tokens: FilterToken[]; onChange: (t: FilterToken[]) => void; and: boolean; onAnd: (v: boolean) => void; fields?: string[]; placeholder?: string; className?: string }
  export const FilterTokenBuilder: React.FC<FilterTokenBuilderProps>
}

declare module "detail-drawer-split" {
  import * as React from "react"
  export type DetailDrawerSplitProps = { open: boolean; onClose: () => void; title?: React.ReactNode; index?: number; count?: number; onPrev?: () => void; onNext?: () => void; defaultWidth?: number; minWidth?: number; maxWidth?: number; persistKey?: string; children: React.ReactNode; className?: string }
  export const DetailDrawerSplit: React.FC<DetailDrawerSplitProps>
}

declare module "radial-gauge" {
  import * as React from "react"
  export type RadialGaugeProps = { value: number; min?: number; max?: number; zones?: { to: number; color: string; label?: string }[]; label?: string; unit?: string; precision?: number; size?: number; className?: string }
  export const RadialGauge: React.FC<RadialGaugeProps>
}

declare module "cron-preview" {
  import * as React from "react"
  export type CronPreviewProps = { expr: string; onChange: (v: string) => void; now?: () => Date; className?: string }
  export const CronPreview: React.FC<CronPreviewProps>
}

declare module "inline-edit-cell" {
  import * as React from "react"
  export type InlineEditCellProps = { value: string; name?: string; onSave: (v: string) => Promise<void>; mono?: boolean; width?: number; className?: string }
  export const InlineEditCell: React.FC<InlineEditCellProps>
}

declare module "kpi-tile-live" {
  import * as React from "react"
  export type KpiTileLiveProps = { label: string; value: number; prev?: number; format?: (v: number) => string; unit?: string; danger?: boolean; spark?: number[]; className?: string }
  export const KpiTileLive: React.FC<KpiTileLiveProps>
}

declare module "stepper-form" {
  import * as React from "react"
  export type Field = { key: string; label: string; type?: string; required?: boolean; placeholder?: string; validate?: (v: string, d: Record<string, string>) => string | null }
  export type Step = { title: string; fields: Field[] }
  export type StepperFormProps = { steps: Step[]; onSubmit: (data: Record<string, string>) => void; submitLabel?: string; className?: string }
  export const StepperForm: React.FC<StepperFormProps>
}

declare module "status-health-strip" {
  import * as React from "react"
  export type Service = { name: string; state: "operational" | "degraded" | "down"; region?: string; note?: string }
  export type StatusHealthStripProps = { services: Service[]; region?: string; onRegion?: (r: string) => void; className?: string }
  export const StatusHealthStrip: React.FC<StatusHealthStripProps>
}

declare module "job-tray" {
  import * as React from "react"
  export type Job = { id: string; label: string; status: "queued" | "running" | "done" | "error"; progress?: number; log?: string[] }
  export type JobTrayProps = { jobs: Job[]; onCancel?: (j: Job) => void; onDismiss?: (id: string) => void; className?: string }
  export const JobTray: React.FC<JobTrayProps>
}

declare module "event-timeline-day" {
  import * as React from "react"
  export type TimelineEvent = { id: string; at: string | number | Date; actor?: string; kind: "create" | "edit" | "comment" | "alert" | "deploy"; text: string }
  export type EventTimelineDayProps = { events: TimelineEvent[]; groupBy?: (e: TimelineEvent) => string; className?: string }
  export const EventTimelineDay: React.FC<EventTimelineDayProps>
}

declare module "citation-hover-card" {
  import * as React from "react"
  export type Source = { n: number; title: string; domain: string; snippet: string; href?: string }
  export type CitationHoverCardProps = { children: string; sources: Source[]; className?: string }
  export const CitationHoverCard: React.FC<CitationHoverCardProps>
}

declare module "ai-prompt-composer" {
  import * as React from "react"
  export type AiPromptComposerProps = {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  busy?: boolean
  models?: { id: string; label: string }[]
  model?: string
  onModel?: (id: string) => void
  attachments?: string[]
  onAttach?: () => void
  contextLimit?: number
  className?: string
}
  export const AiPromptComposer: React.FC<AiPromptComposerProps>
}

declare module "async-multiselect" {
  import * as React from "react"
  export type PickOption = { id: string; label: string; meta?: string }
  export type AsyncMultiselectProps = {
  value: PickOption[]
  onValueChange: (v: PickOption[]) => void
  loadItems: (query: string, page: number) => Promise<{ items: PickOption[]; more: boolean }>
  placeholder?: string
  onCreate?: (label: string) => PickOption | undefined
  label?: string
  className?: string
}
  export const AsyncMultiselect: React.FC<AsyncMultiselectProps>
}

declare module "switchboard-reveal" {
  import * as React from "react"
  export type SwitchRoute = { id: string; label: string; desc?: string; meta?: string }
  export type SwitchboardProps = { eyebrow?: string; title?: React.ReactNode; intro?: React.ReactNode; routes: SwitchRoute[]; inLabel?: string; connectedLabel?: string; onSelect?: (r: SwitchRoute) => void; className?: string }
  export const Switchboard: React.FC<SwitchboardProps>
}

declare module "mention-textarea" {
  import * as React from "react"
  export type Mention = { id: string; label: string; sub?: string }
  export type MentionTextareaProps = {
  value: string
  onChange: (v: string) => void
  mentions?: Mention[]
  commands?: { cmd: string; describe: string; run: () => void }[]
  max?: number
  onSubmit?: () => void
  placeholder?: string
  className?: string
}
  export const MentionTextarea: React.FC<MentionTextareaProps>
}

declare module "ai-answer-toolbar" {
  import * as React from "react"
  export type AiAnswerToolbarProps = { tokensUsed?: number; onCopy?: () => Promise<void> | void; onRegenerate?: () => void; onThumbs?: (v: "up" | "down") => void; rating?: "up" | "down" | null; onEdit?: () => void; streaming?: boolean; className?: string }
  export const AiAnswerToolbar: React.FC<AiAnswerToolbarProps>
}

declare module "countdown-flare" {
  import * as React from "react"
  export type CountdownFlareProps = { to: string | number; title?: React.ReactNode; lead?: string; firedLabel?: string; compact?: boolean; children?: React.ReactNode; onFire?: () => void; className?: string }
  export const CountdownFlare: React.FC<CountdownFlareProps>
}

declare module "code-snippet-panel" {
  import * as React from "react"
  export type CodeSnippetPanelProps = { code: string; language?: string; title?: string; copyText?: string; className?: string }
  export const CodeSnippetPanel: React.FC<CodeSnippetPanelProps>
}

declare module "storage-ring-meter" {
  import * as React from "react"
  export type RingSeg = { label: string; bytes: number; color?: string }
  export type StorageRingMeterProps = { segments: RingSeg[]; quota: number; label?: string; resetNote?: string; className?: string }
  export const StorageRingMeter: React.FC<StorageRingMeterProps>
}

declare module "sticky-group-list" {
  import * as React from "react"
  export const StickyGroupList: React.FC<Record<string, any>>
}

declare module "funnel-stage-bars" {
  import * as React from "react"
  export type FunnelStage = { label: string; value: number }
  export type FunnelStageBarsProps = { stages: FunnelStage[]; eyebrow?: string; topLabel?: string; className?: string }
  export const FunnelStageBars: React.FC<FunnelStageBarsProps>
}

declare module "switch-audit-trail" {
  import * as React from "react"
  export type AuditEntry = { id: string; at: string; actor: string; field: string; from: string; to: string }
  export type SwitchAuditTrailProps = { entries: AuditEntry[]; onRevert?: (e: AuditEntry) => void; className?: string }
  export const SwitchAuditTrail: React.FC<SwitchAuditTrailProps>
}

declare module "upload-queue" {
  import * as React from "react"
  export type UploadFile = { id: string; name: string; size: number; status: "waiting" | "uploading" | "done" | "error"; progress?: number; tries?: number; error?: string }
  export type UploadQueueProps = { files: UploadFile[]; onRetry?: (id: string) => void; onRemove?: (id: string) => void; className?: string }
  export const UploadQueue: React.FC<UploadQueueProps>
}

declare module "departure-board" {
  import * as React from "react"
  export type DepartureItem = { zone?: string; label: string; value: string; note?: string; tone?: "default" | "now" | "off" }
  export type DepartureBoardProps = { eyebrow?: string; title?: React.ReactNode; items: DepartureItem[]; speed?: number; rowStagger?: number; className?: string }
  export const DepartureBoard: React.FC<DepartureBoardProps>
}

declare module "ghost-suggest-input" {
  import * as React from "react"
  export type GhostSuggestInputProps = {
  value: string
  onChange: (v: string) => void
  suggest: (v: string) => string | null
  placeholder?: string
  label?: string
  className?: string
}
  export const GhostSuggestInput: React.FC<GhostSuggestInputProps>
}

declare module "bulk-select-bar" {
  import * as React from "react"
  export type BulkAction = { label: string; run: (ids: string[]) => void; tone?: "default" | "danger" }
  export type BulkSelectBarProps = { selected: string[]; total: number; actions: BulkAction[]; onClear: () => void; className?: string }
  export const BulkSelectBar: React.FC<BulkSelectBarProps>
}

declare module "copy-secret-field" {
  import * as React from "react"
  export type CopySecretFieldProps = { value: string; onRotate?: () => void; rotating?: boolean; label?: string; mono?: boolean; className?: string }
  export const CopySecretField: React.FC<CopySecretFieldProps>
}

declare module "chat-thread-virtual" {
  import * as React from "react"
  export type Msg = { id: string; me?: boolean; author?: string; at: string; text: string; streaming?: boolean; reactions?: string[] }
  export type ChatThreadVirtualProps = { messages: Msg[]; canEdit?: (m: Msg) => boolean; onEdit?: (id: string, text: string) => void; className?: string }
  export const ChatThreadVirtual: React.FC<ChatThreadVirtualProps>
}

declare module "inbox-snooze-center" {
  import * as React from "react"
  export type InboxItem = { id: string; title: string; body?: string; at: string; read?: boolean }
  export type InboxSnoozeCenterProps = { items: InboxItem[]; onComplete: (id: string) => void; onSnooze: (id: string, span: string) => void; completed: number; className?: string }
  export const InboxSnoozeCenter: React.FC<InboxSnoozeCenterProps>
}

declare module "grouped-search-results" {
  import * as React from "react"
  export type SearchHit = { id: string; kind: "doc" | "person" | "tag"; title: string; sub?: string }
  export type GroupedSearchResultsProps = { query: string; items: SearchHit[]; onSelect: (h: SearchHit) => void; className?: string }
  export const GroupedSearchResults: React.FC<GroupedSearchResultsProps>
}

declare module "date-range-presets" {
  import * as React from "react"
  export type Range = { from: Date; to: Date; label?: string }
  export type DateRangePresetsProps = { value: Range | null; onChange: (r: Range | null) => void; presets?: { label: string; days: number }[]; allowCompare?: boolean; className?: string }
  export const DateRangePresets: React.FC<DateRangePresetsProps>
}

declare module "undo-history-slider" {
  import * as React from "react"
  export type Version = { id: string; at: string; label: string }
  export type UndoHistorySliderProps = { versions: Version[]; head?: string; render: (v: Version) => React.ReactNode; onRestore: (id: string) => void; className?: string }
  export const UndoHistorySlider: React.FC<UndoHistorySliderProps>
}

declare module "product-tour-spotlight" {
  import * as React from "react"
  export type TourStep = { selector: string; title: string; body: React.ReactNode }
  export type ProductTourSpotlightProps = { steps: TourStep[]; step?: number; onStep?: (i: number) => void; onExit?: () => void; className?: string }
  export const ProductTourSpotlight: React.FC<ProductTourSpotlightProps>
}

declare module "segmented-control" {
  import * as React from "react"
  export type SegOption = { value: string; label: string; icon?: React.ElementType }
  export type SegmentedControlProps = { options: SegOption[]; value: string; onChange: (v: string) => void; size?: "sm" | "md"; className?: string }
  export const SegmentedControl: React.FC<SegmentedControlProps>
}

declare module "token-input" {
  import * as React from "react"
  export type TokenInputProps = { value: string[]; onChange: (v: string[]) => void; placeholder?: string; validate?: (t: string) => string | null; label?: string; className?: string }
  export const TokenInput: React.FC<TokenInputProps>
}

declare module "tree-grid-table" {
  import * as React from "react"
  export type TreeNode = { id: string; label: string; meta?: string; children?: TreeNode[] }
  export type TreeGridTableProps = { nodes: TreeNode[]; loadChildren?: (n: TreeNode) => Promise<TreeNode[]>; defaultOpen?: string[]; className?: string }
  export const TreeGridTable: React.FC<TreeGridTableProps>
}

declare module "offline-queue-banner" {
  import * as React from "react"
  export type OfflineQueueBannerProps = { online: boolean; queued: number; flushing?: boolean; onRetryNow?: () => void; className?: string }
  export const OfflineQueueBanner: React.FC<OfflineQueueBannerProps>
}

declare module "toast-stack" {
  import * as React from "react"
  export type Toast = { id: string; title: string; body?: string; tone?: "ok" | "err" | "warn" | "info"; action?: { label: string; run: () => void }; duration?: number }
  export type ToastStackProps = { toasts: Toast[]; onDismiss: (id: string) => void; pos?: "br" | "tr" | "bl" | "tl"; className?: string }
  export const ToastStack: React.FC<ToastStackProps>
}

declare module "diff-pane-split" {
  import * as React from "react"
  export type DiffLine = { kind: "ctx" | "add" | "del" | "hunk"; text: string }
  export type DiffPaneSplitProps = { lines: DiffLine[]; file?: string; defaultSplit?: boolean; className?: string }
  export const DiffPaneSplit: React.FC<DiffPaneSplitProps>
}

declare module "finale-confetti" {
  import * as React from "react"
  export type FinaleConfettiProps = { show?: boolean; title?: React.ReactNode; sub?: React.ReactNode; duration?: number; onDone?: () => void; variant?: "band" | "overlay"; className?: string }
  export const FinaleConfetti: React.FC<FinaleConfettiProps>
}

declare module "pipeline-run-graph" {
  import * as React from "react"
  export type Stage = { id: string; label: string; status: "idle" | "queued" | "running" | "pass" | "fail" | "skip"; duration?: string; log?: string[] }
  export type PipelineRunGraphProps = { run?: string; stages: Stage[]; onRerunFailed?: () => void; className?: string }
  export const PipelineRunGraph: React.FC<PipelineRunGraphProps>
}

declare module "drag-number-field" {
  import * as React from "react"
  export type DragNumberFieldProps = { label?: string; value: number; onValueChange: (v: number) => void; step?: number; precision?: number; min?: number; max?: number; unit?: string; className?: string }
  export const DragNumberField: React.FC<DragNumberFieldProps>
}

