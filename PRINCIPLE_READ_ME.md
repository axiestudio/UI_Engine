# Website UI / Frontend Library Stack

This library stack is focused on **website creation**, especially modern landing pages, marketing websites, visual sections, animations, interactive elements, mockups, and polished UI.

The goal is not to replace shadcn/ui. Instead:

- **shadcn/ui + Watermelon UI** = base UI
- **React Bits / Cult UI / Animata** = website design and visual components
- **Eldora UI** = device and browser mockups
- **Tailark** = hero/landing-page inspiration
- Specialized libraries = animation, interaction, charts, 3D, etc.

---

# 1. Core UI

## shadcn/ui

https://ui.shadcn.com/

**Use case:** Main UI foundation.

Used for standard components such as:

- Buttons
- Cards
- Dialogs
- Forms
- Inputs
- Selects
- Tabs
- Navigation
- Menus
- Tables

This should remain the **base component system**.

---

## Watermelon UI

https://watermelontools.com/

**Use case:** Additional components that work well with the shadcn ecosystem.

Useful when shadcn does not already provide the specific component or visual pattern needed.

---

# 2. Website Design Components

## React Bits

https://www.reactbits.dev/

**Use case:** High-quality website components and visual effects.

Especially useful for:

- Hero sections
- Animated text
- Animated backgrounds
- Cards
- Buttons
- Hover effects
- Visual effects
- Landing-page sections
- Decorative components
- Interactive website elements

**Importance: HIGH**

React Bits is one of the strongest sources for the actual **visual design of the website**.

---

## Cult UI

https://www.cult-ui.com/

**Use case:** Modern, visually interesting UI components.

Useful for:

- Interactive components
- Website sections
- Cards
- Buttons
- Effects
- Modern UI patterns
- Animated components

**Importance: HIGH**

Cult UI is another strong source for components that make the website feel more designed rather than just using basic UI primitives.

---

## Animata

https://animata.design/

**Use case:** Animated website components.

Useful for:

- Animated cards
- Hover effects
- Background effects
- Text effects
- Interactive sections
- Decorative animations
- Landing-page components

**Importance: HIGH**

Animata and React Bits are particularly useful for the **visual/design side** of the library.

---

# 3. Mockups / Product Presentation

## Eldora UI

https://www.eldoraui.site/

**Use case:** Device and browser mockups for websites.

Useful for presenting:

- Products
- Websites
- Apps
- Dashboards
- Screenshots
- SaaS products
- Mobile applications

Important components include:

### iPad

https://www.eldoraui.site/docs/components/ipad

### iPhone 17 Pro

https://www.eldoraui.site/docs/components/iphone-17-pro

### MacBook Pro

https://www.eldoraui.site/docs/components/macbook-pro

### Safari Browser

https://www.eldoraui.site/docs/components/safari-browser

**Importance: HIGH**

This is especially useful for hero sections and product showcase sections where you want to show a website or application inside a realistic device/browser frame.

---

# 4. Hero / Landing Page Inspiration

## Tailark

https://tailark.com/

**Use case:** Landing-page and hero-section designs.

Useful for:

- Hero sections
- Marketing websites
- SaaS landing pages
- Feature sections
- Pricing sections
- CTA sections
- Page layouts

**Important:** Tailark is freemium and has limited availability.

Therefore it is useful both as a component source and as **design inspiration**.

---

# 5. Animation

## Motion Primitives

https://motion-primitives.com/

**Use case:** Ready-made React animation components.

Useful for:

- Text animations
- Transitions
- Hover effects
- Layout animations
- Component animations
- Entrance animations

Good when you want a reusable animation rather than building it yourself.

---

## GSAP

https://gsap.com/

**Use case:** Advanced animation engine.

Useful for:

- Complex timelines
- Scroll animations
- Hero animations
- SVG animations
- Sequenced animations
- Interactive website animations
- High-performance animations

GSAP is especially useful for more advanced website experiences.

---

## Lenis

https://lenis.darkroom.engineering/

**Use case:** Smooth scrolling.

Useful for:

- Smooth scrolling
- Scroll-based animations
- Premium landing pages
- Scroll-driven website experiences

Often useful together with GSAP.

---

## React Spring

https://react-spring.dev/

**Use case:** Physics-based animation for React.

Useful for:

- Spring animations
- Drag interactions
- Interactive components
- Smooth transitions
- UI state changes

---

## Anime.js

https://animejs.com/

**Use case:** Lightweight animation library.

Useful for:

- Simple animations
- SVG animations
- DOM animations
- Small interactive effects
- Decorative animations

---

# 6. Interaction / Positioning

## Floating UI

https://floating-ui.com/

**Use case:** Positioning floating UI elements.

Useful for:

- Tooltips
- Popovers
- Dropdowns
- Context menus
- Floating menus
- Floating controls

It handles the difficult positioning logic instead of implementing it manually.

---

## Embla Carousel

https://www.embla-carousel.com/

**Use case:** Carousel and horizontal scrolling components.

Useful for:

- Image galleries
- Product showcases
- Testimonials
- Hero carousels
- Horizontal content
- Sliders

---

## Vaul

https://vaul.emilkowal.ski/

**Use case:** Drawer components.

Useful for:

- Mobile navigation
- Bottom sheets
- Mobile menus
- Filter panels
- Action panels

---

## Sonner

https://sonner.emilkowal.ski/

**Use case:** Toast notifications.

Useful for:

- Success messages
- Error messages
- Confirmations
- Temporary notifications
- User feedback

---

# 7. Charts / Data Visualization

## Bklit

https://bklit.com/

**Use case:** Modern chart components and data visualization.

Useful when a website needs visually polished charts without building the chart UI from scratch.

---

## Recharts

https://recharts.org/

**Use case:** React chart library.

Useful for:

- Line charts
- Bar charts
- Area charts
- Pie charts
- Data visualizations

Good for simpler React-based chart requirements.

---

## Apache ECharts

https://echarts.apache.org/

**Use case:** Advanced data visualization.

Useful for:

- Complex charts
- Large datasets
- Interactive charts
- Advanced visualizations
- Highly configurable charts

---

# 8. 3D / Interactive Graphics

## Three.js

https://threejs.org/

**Use case:** 3D graphics on the web.

Useful for:

- 3D product presentations
- Interactive 3D objects
- 3D backgrounds
- WebGL effects
- Interactive website experiences

---

## React Three Fiber

https://r3f.docs.pmnd.rs/

**Use case:** Using Three.js inside React.

Useful when a React website needs:

- 3D scenes
- Interactive objects
- 3D animations
- WebGL experiences

Three.js provides the underlying 3D technology while React Three Fiber makes it easier to integrate into React.

---

## Rive

https://rive.app/

**Use case:** Interactive animations.

Useful for:

- Animated illustrations
- Interactive icons
- Hero animations
- Product animations
- State-based animations
- Interactive graphics

Rive is particularly useful when an animation needs to **respond to user interaction** rather than simply play once.

---

## Lottie

https://lottiefiles.com/

**Use case:** Reusable animation assets.

Useful for:

- Animated illustrations
- Loading animations
- Icons
- Small decorative animations
- Marketing website animations

---

# Overall Stack

## Base

- shadcn/ui
- Watermelon UI

## Website Design

- React Bits
- Cult UI
- Animata

## Mockups

- Eldora UI

## Hero / Inspiration

- Tailark

## Animation

- Motion Primitives
- GSAP
- Lenis
- React Spring
- Anime.js

## Interaction

- Floating UI
- Embla Carousel
- Vaul
- Sonner

## Charts

- Bklit
- Recharts
- Apache ECharts

## 3D / Graphics

- Three.js
- React Three Fiber
- Rive
- Lottie

---

# Main Principle

The stack should not try to make every library do the same thing.

**shadcn/ui** provides the foundation.

**Watermelon UI** expands the foundation.

**React Bits, Cult UI and Animata** provide the actual modern website components and visual design.

**Eldora UI** provides realistic product/device presentation.

**Tailark** provides hero and landing-page inspiration.

The remaining libraries provide specialized functionality:

- Animation → Motion Primitives, GSAP, Lenis, React Spring, Anime.js
- Positioning → Floating UI
- Carousels → Embla
- Drawers → Vaul
- Notifications → Sonner
- Charts → Bklit, Recharts, ECharts
- 3D → Three.js, React Three Fiber
- Interactive animation → Rive
- Animation assets → Lottie