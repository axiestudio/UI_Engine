import "./index.css"

export { Drawer } from "./components/drawer/SideDrawer"
export type { DrawerProps, DrawerAction } from "./components/drawer/SideDrawer"

// Vendored upstream registry sources (provenance kept for direct use):
export {
  Drawer as VaulDrawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./components/watermelon/drawer"
export { InView } from "./components/primitives/in-view"
