import "./index.css"

export { Schedule } from "./components/schedule/Schedule"
export type { ScheduleProps, WeekDay, Slot } from "./components/schedule/Schedule"

// Vendored upstream registry sources (provenance kept for direct use).
// NOTE: schedule-date / schedule-button are demo-grade (fixed colors/dates) — export them to reuse,
// but the tokenized `Schedule` above is the production composition.
export { ScheduleDate as ScheduleDateRange } from "./components/watermelon/schedule-date"
export { ScheduleDate as ScheduleDatePicker } from "./components/watermelon/schedule-date-base"
export { ScheduleButton } from "./components/watermelon/schedule-button"
export { Magnetic } from "./components/primitives/magnetic"
export { InView } from "./components/primitives/in-view"
export { Button, buttonVariants } from "./components/ui/button"
