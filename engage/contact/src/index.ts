import "./index.css"

export { Contact } from "./components/contact/Contact"
export type { ContactProps, ContactFieldDef, ContactFieldType, ContactInfoItem } from "./components/contact/Contact"

// Vendored upstream registry sources (provenance kept for direct use):
export { default as ProjectInquirySection } from "./components/watermelon/contact-3"
export { InView } from "./components/primitives/in-view"
export { Magnetic } from "./components/primitives/magnetic"
export { TextEffect } from "./components/primitives/text-effect"

export { Button, buttonVariants } from "./components/ui/button"
export { Input } from "./components/ui/input"
export { Textarea } from "./components/ui/textarea"
export { Label } from "./components/ui/label"
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"

export { cn } from "./lib/utils"
