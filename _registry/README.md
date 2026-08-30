# _registry — local snapshots of the upstream component registries

Not a workspace package (no package.json). This is the offline library we parse when creating new UI presets.

## watermelon/
- `registry.json` — the full shadcn-style index (1073 items) from https://registry.watermelon.sh/r/registry.json
- `r/<item>.json` — individual registry items (complete TSX `content` per file). Refresh any item:
  `curl -s https://registry.watermelon.sh/r/<name>.json -o UI/_registry/watermelon/r/<name>.json`
- Item shape: `{ name, type, dependencies[], registryDependencies[], files[{path, content}] }` — `files[].content` is the raw upstream source. Extract with e.g.
  `python3 -c "import json;print(json.load(open('<item>.json'))['files'][0]['content'])"`

## motion-primitives/
- `components-core/*.tsx` — all shipped primitives from github.com/ibelick/motion-primitives `components/core` (MIT, (c) 2024 ibelick), fetched from `main` 2026-08-30.
- `repo-tree.json` — GitHub API tree of the repo for locating other files (docs examples under `app/docs/`).
- Their live registry (https://motion-primitives.com/r/<name>.json) sits behind a Vercel bot check for scripts — use the GitHub snapshot.

## Convention for new presets (see UI/footer, UI/visit-us, …)
Vendored files keep a provenance header naming the exact registry item / GitHub path.
Declared per package in `package.json` under `presetSources`.
