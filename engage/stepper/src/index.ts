import "./index.css"

export { NumberStepper } from "./components/stepper/NumberStepper"
export type { NumberStepperProps } from "./components/stepper/NumberStepper"
export { ProgressSteps } from "./components/stepper/ProgressSteps"
export type { ProgressStepsProps, WizardStep } from "./components/stepper/ProgressSteps"

// Vendored upstream registry sources (provenance kept for direct use):
export { Stepper as WmQuantityStepper } from "./components/watermelon/stepper"
export type { StepperProps as WmStepperProps } from "./components/watermelon/stepper"
export { InView } from "./components/primitives/in-view"
