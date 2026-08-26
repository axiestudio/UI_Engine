# header

Professional header — shadcn/base + Radix UI. Built to ship to npm.

- **Desktop:** `NavigationMenu` with shared `Viewport` (Products 2-col, Solutions featured card, Resources list)
- **Mobile:** `Sheet` **bottom → up** (handle, Collapsible nested, 88vh)
- **Search:** `Dialog` + `cmdk` `Command` (⌘K / `/` to open, filters all nav items)
- **CTA:** `Button` + `ButtonGroup` (grouped shadow)
- **Style:** Pure white `#fff` + jet black `#121212` (21:1), `Inter 800` + `Space Grotesk 700`, `15px`, `radius 14px`

## Install

```bash
npm install header
# peer: react, react-dom
# requires tailwindcss in consumer
```

Tailwind setup — add to your `tailwind.config.js`:

```js
content: ["./src/**/*.{ts,tsx}", "./node_modules/header/dist/**/*.{js}"]
```

Tokens — copy `src/index.css` `:root` vars to your `globals.css`:

```css
@import "header/styles.css"; /* or copy :root tokens */
@tailwind base; @tailwind components; @tailwind utilities;
```

## Usage

```tsx
import { Header } from "header"
import "header/styles.css" // or your own tokens

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
```

No props required — edit `src/components/header/Header.tsx` `NAV_ITEMS` to change menu.

## Develop

```bash
npm run build # tsc + vite lib -> dist/header.es.js + header.css + index.d.ts
```

Engine preview is in `../engine` (`npm run dev`).

## Exports

- `Header` — main component
- `Button`, `ButtonGroup`, `Badge`, `NavigationMenu`, `Sheet`, `Collapsible`, `Dialog`, `Command`, `cn`
