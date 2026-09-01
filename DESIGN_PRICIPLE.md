# UI Design Principles

## Purpose

This project is focused on creating **high-quality UI designs for websites**.

The goal is not to build every component, animation, interaction, or visual effect from scratch.

Instead, the project should combine existing **UI primitives, component libraries, animation libraries, and visual systems** to create polished website designs.

The libraries are the **building blocks**.

Our own work is primarily the **composition, styling, layout, visual direction, and overall website experience**.

---

# 1. Use Existing Primitives

We should avoid recreating common UI functionality when a mature library already provides it.

### Foundation

**shadcn/ui**

https://ui.shadcn.com/

Provides the base UI system.

Examples:

* Buttons
* Inputs
* Dialogs
* Cards
* Tabs
* Menus
* Forms
* Navigation

### Extension

**Watermelon UI**

https://watermelontools.com/

Provides additional components that fit into the shadcn-style ecosystem.

### Principle

> **Use existing primitives for common UI functionality. Spend our effort on design and composition instead of rebuilding infrastructure.**

---

# 2. Prefer Design-Ready Components for Websites

A normal component library gives us functionality.

For this project, we also need components that already have a strong **visual identity**.

### React Bits

https://www.reactbits.dev/

### Cult UI

https://www.cult-ui.com/

### Animata

https://animata.design/

These libraries are particularly valuable because they provide components that already demonstrate:

* Strong visual design
* Animation
* Interaction
* Modern layouts
* Website-oriented patterns
* Decorative effects

### Principle

> **When designing a website, prefer proven visual components when they already achieve the desired result.**

We should not recreate an animated card, text effect, background effect, or visual interaction from zero if an existing component already provides a strong implementation.

---

# 3. Use Specialized Libraries for Specialized Problems

Each library should have a clear responsibility.

We should not introduce a large dependency simply because it has a few nice components.

### Animation

**Motion Primitives**
https://motion-primitives.com/

Reusable React animation patterns.

**GSAP**
https://gsap.com/

Complex and highly controlled animation.

**Lenis**
https://lenis.darkroom.engineering/

Smooth scrolling and scroll-based experiences.

**React Spring**
https://react-spring.dev/

Physics-based interaction and transitions.

**Anime.js**
https://animejs.com/

Lightweight general-purpose animation.

### Principle

> **Choose the animation tool based on the type of animation, not personal preference alone.**

Simple animation should remain simple.

Complex timeline and scroll experiences can use GSAP.

Interactive physics can use React Spring.

---

# 4. Build Website Experiences, Not Just Components

The final product should not feel like a collection of unrelated components.

Components should be composed into complete website experiences.

For example:

**Hero**

→ animated typography
→ device mockup
→ background effect
→ CTA
→ scroll interaction

**Feature section**

→ visual component
→ animation
→ supporting content
→ interaction

**Product showcase**

→ MacBook/iPhone mockup
→ product screenshot
→ scroll animation

### Principle

> **Components are building blocks. The design comes from how those blocks are composed.**

---

# 5. Use Mockups for Product Presentation

### Eldora UI

https://www.eldoraui.site/

Eldora UI is useful for presenting products inside realistic environments.

Examples:

* iPad
* iPhone
* MacBook
* Safari Browser

Useful for:

* Product showcases
* Hero sections
* SaaS presentations
* App presentations
* Website previews

### Principle

> **Use realistic presentation components when the purpose is to showcase a product rather than simply display an image.**

---

# 6. Treat Inspiration Sources Differently

### Tailark

https://tailark.com/

Tailark is useful for:

* Hero designs
* Landing pages
* Marketing sections
* Layout inspiration

Because it is freemium and more limited, it should not necessarily be treated as a primary component source.

It is valuable as a **reference for composition and visual direction**.

### Principle

> **Not every resource needs to become a dependency. Some resources exist primarily to inspire design decisions.**

---

# 7. Use Interaction Libraries Instead of Rebuilding Interaction Logic

### Floating UI

https://floating-ui.com/

For:

* Tooltips
* Popovers
* Dropdowns
* Floating menus

### Embla

https://www.embla-carousel.com/

For:

* Carousels
* Galleries
* Horizontal scrolling
* Product showcases

### Vaul

https://vaul.emilkowal.ski/

For:

* Drawers
* Bottom sheets
* Mobile panels

### Sonner

https://sonner.emilkowal.ski/

For:

* Toasts
* Notifications
* Temporary feedback

### Principle

> **Use specialized interaction libraries for interaction mechanics. Do not spend design time rebuilding reliable interaction infrastructure.**

---

# 8. Keep Visualization Specialized

### Bklit

https://bklit.com/

Modern chart and visualization components.

### Recharts

https://recharts.org/

React-based charts.

### Apache ECharts

https://echarts.apache.org/

More advanced and configurable visualization.

### Principle

> **Use the simplest visualization library that can achieve the required result.**

The project should focus on how the visualization fits into the website rather than rebuilding charting functionality.

---

# 9. Use 3D Only When It Adds Value

### Three.js

https://threejs.org/

3D and WebGL.

### React Three Fiber

https://r3f.docs.pmnd.rs/

Three.js integration for React.

### Principle

> **3D should support the design, not become the design.**

Use it when it creates a meaningful visual experience:

* Product visualization
* Interactive objects
* Hero experiences
* 3D backgrounds
* Visual storytelling

Do not introduce 3D simply because it is technically possible.

---

# 10. Interactive Animation vs Animation Assets

### Rive

https://rive.app/

For interactive animations that respond to state or user interaction.

### Lottie

https://lottiefiles.com/

For reusable animation assets.

### Principle

Use **Rive** when the animation needs interaction or state.

Use **Lottie** when the animation is primarily an asset that plays as part of the design.

---

# 11. Do Not Duplicate Existing Libraries

Before creating a new component, ask:

1. Does shadcn already provide it?
2. Does Watermelon UI provide it?
3. Does React Bits provide a suitable version?
4. Does Cult UI provide it?
5. Does Animata provide it?
6. Is there already a specialized library for the functionality?

Only build it ourselves when the existing solutions do not satisfy the design requirement.

### Principle

> **Reuse first. Compose second. Customize third. Rebuild last.**

---

# 12. Separate Functionality From Design

A component can be technically correct without being visually appropriate.

The project should distinguish between:

### Functionality

Handled by established libraries.

Examples:

* Positioning
* Carousel mechanics
* Dialog behavior
* Animation engines
* Chart rendering
* 3D rendering

### Design

Handled by our project.

Examples:

* Layout
* Typography
* Spacing
* Composition
* Visual hierarchy
* Color
* Content
* Responsive behavior
* Component combinations
* Overall page experience

### Principle

> **Libraries solve technical problems. Our design system solves visual problems.**

---

# 13. Avoid Library-Driven Design

The project should not become:

> "This library has this component, therefore we use it."

Instead:

> "This design requires this visual behavior, which library gives us the best building block?"

The design comes first.

The library comes second.

---

# 14. Overall Design Philosophy

The project follows a **composable design approach**.

We combine:

**Foundation**

shadcn/ui
↓
Watermelon UI

**Website Components**

React Bits
Cult UI
Animata

**Presentation**

Eldora UI
Tailark inspiration

**Animation**

Motion Primitives
GSAP
Lenis
React Spring
Anime.js

**Interaction**

Floating UI
Embla
Vaul
Sonner

**Visualization**

Bklit
Recharts
ECharts

**Advanced Visuals**

Three.js
React Three Fiber
Rive
Lottie

The purpose is not to make these libraries look like separate products.

The purpose is to make them feel like **one coherent design system**.

---

# Core Principle

> **Do not reinvent the building blocks. Build better experiences from them.**

Use established libraries for functionality and implementation.

Use our own design system for:

* Composition
* Visual hierarchy
* Layout
* Typography
* Spacing
* Responsive behavior
* Branding
* Page structure
* Overall experience

The value of this project is therefore not in creating another button, carousel, tooltip, animation engine, or chart library.

The value is in **combining proven building blocks into high-quality website designs that are reusable, consistent, and visually strong.**
