# registry — shadcn-compatible distribution channel

Generated from the vendored sources by `generate.py` (single source of truth: `UI/*/src`).

```
registry.json      # index — 19 items
r/<name>.json      # per-preset manifest with full file contents (registry-item schema)
```

## Consume (one command, own the source)

In any project with shadcn set up (Tailwind + the standard `cn()`/alias):

```sh
npx shadcn add https://<your-host>/r/steps.json
```

The CLI writes the raw `.tsx` into the consumer's repo (`components/`, `lib/`), installs the infra deps from the item's `dependencies` (`motion`, `radix-ui`, `lucide-react`, …), and that's it — the code is theirs, editable, no runtime registry, no npm package.

## Host (any static host)

Deploy this folder as static files. Every URL in `presetSources`/headers is metadata only — the CLI needs nothing but these JSONs. Examples:

- GitHub Pages: push `registry/` to a `gh-pages` branch → `https://<user>.github.io/<repo>/r/steps.json`
- Vercel/Netlify: point a project at this folder

## Regenerate

After editing any package's sources:

```sh
python3 UI/registry/generate.py
```

## Themes/tokens note

Items ship components only, not our `index.css` brandkit. Consumers render inside projects that already define the standard shadcn HSL tokens (`--background`, `--foreground`, `--primary`, `--radius`, …). Ship `UI/*/src/index.css` tokens as a separate style registry item later if desired.
