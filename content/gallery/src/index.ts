import "./index.css"

export { Gallery } from "./components/gallery/Gallery"
export type { GalleryProps, GalleryPhoto } from "./components/gallery/Gallery"

// Motion-Primitives building blocks (vendored, MIT):
export {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogContainer,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
} from "./components/primitives/morphing-dialog"
export { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from "./components/primitives/image-comparison"
export { InView } from "./components/primitives/in-view"

export { SectionShell, SectionHead, Grain, Dots, CornerTicks, Sheen, Accent, MonoLabel, Ordinal } from "./components/primitives/handcraft"
