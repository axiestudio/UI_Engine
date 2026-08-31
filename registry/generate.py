#!/usr/bin/env python3
"""Generate a shadcn-compatible component registry from the vendored UI packages.

Output: UI/registry/registry.json (index) + UI/registry/r/<name>.json (per-preset items).
Host the registry/ folder on any static host (GitHub Pages, Vercel, S3) and consumers run:
  npx shadcn add https://<host>/r/<name>.json
The CLI writes the raw .tsx into their project — they own the source, no npm package needed.

Re-run after editing any package:  python3 UI/registry/generate.py
"""
import json, pathlib

UI = pathlib.Path(__file__).resolve().parent.parent
PACKAGES = [
    "steps",
    "auth",
    "consent",
    "changelog",
    "error",
    "marquee",
    "newsletter",
    "showcase",
    "search",
    "hero",
    "video-demo",
    "compare",
    "roadmap",
    "careers",
    "events",
    "waitlist",
    "help-center",
    "case-study",
    "empty-state",
    "curtain-call",
    "departure-board",
    "film-strip-wind",
    "switchboard-reveal",
    "stamp-fold",
    "boarding-pass-gate",
    "applause-meter",
    "spotlight-pickup",
    "vault-dial",
    "encore-bows",
    "blinds-slat",
    "elevator-floors",
    "intermission-card",
    "gallery-rails",
    "marquee-lights",
    "signal-flags",
    "ticket-rush",
    "airlock-cycle",
    "house-programme",
    "ink-bloom",
    "typewriter-manifesto",
    "stage-lights-up",
    "projection-burn",
    "aperture-hero",
    "countdown-flare",
    "red-carpet-scroll",
    "neon-beacon",
    "zip-reveal",
    "vinyl-spin",
    "page-turn",
    "finale-confetti",


    "ghost-suggest-input",
    "citation-hover-card",
    "tabs-overflow-strip",
    "async-multiselect",
    "offline-queue-banner",
    "inline-edit-cell",
    "token-input",
    "status-health-strip",
    "grouped-search-results",
    "date-range-presets",
    "activity-heatmap",
    "chat-thread-virtual",
    "upload-queue",
    "password-meter",
    "drag-number-field",
    "undo-history-slider",
    "radial-gauge",
    "code-snippet-panel",
    "filter-token-builder",
    "ai-change-review",
    "annotation-pin-layer",
    "mention-textarea",
    "diff-pane-split",
    "tree-grid-table",
    "keyboard-map-overlay",
    "breadcrumb-collapse",
    "toast-stack",
    "context-menu-stack",
    "sticky-group-list",
    "sparkline-cell",
    "kpi-tile-live",
    "job-tray",
    "inbox-snooze-center",
    "event-timeline-day",
    "smart-skeleton",
    "cron-preview",
    "stepper-form",
    "ai-answer-toolbar",
    "permission-matrix",
    "switch-audit-trail",
    "bulk-select-bar",
    "funnel-stage-bars",
    "cmd-palette",
    "merge-conflict-panel",
    "copy-secret-field",
    "product-tour-spotlight",
    "detail-drawer-split",
    "ai-prompt-composer",
    "pipeline-run-graph",
    "storage-ring-meter",
    "segmented-control",

    # branding family (professional pass 2026-08-31)
    "ink-trust", "archive-stamp", "brand-badge-wall", "brand-field-guide", "brand-heartbeat",
    "brand-lexicon", "brand-pattern-lab", "brand-timeline-echo", "co-brand-lockup",
    "logo-constellation", "logo-motion-library", "logo-scroll-mark", "mission-etch",
    "mood-portal", "palette-recipe", "signature-move", "sound-of-brand", "swatch-spectrum",
    "tone-ribbon", "typo-ramp-brand", "value-orbit", "voice-magnet", "wordmark-lab",

    # device stage family (showcase mockups)
    "device-desktop", "device-laptop", "device-tablet", "device-mobile", "device-responsive",

    # layer-stack family (composable sandwiches)
    "stack-burger", "stack-pricing", "stack-proof", "stack-receipt", "stack-onboard",
    "stack-event", "stack-fund", "stack-course", "stack-job", "stack-listing",

    # embla · floating-ui · gsap composites
    "embla-lookbook", "embla-time-picker", "embla-chip-rail",
    "floating-filter-toolbar", "floating-pin-notes", "floating-share-sheet",
    "gsap-assembly-line", "gsap-kinetic-marquee", "gsap-flip-grid", "gsap-split-band",
]
# infra peers the consumer's project must have (react/react-dom assumed present)
EXCLUDED_PEER = {"react", "react-dom"}
TYPE_MAP = {  # vendored path segment -> registry file type + target root
    "primitives": ("registry:component", "components/primitives"),
    "ui": ("registry:component", "components/ui"),
    "lib": ("registry:lib", "lib"),
}

def section_name(pkg):
    return pkg.replace("-", " ").title()

for pkg in PACKAGES:
    cands = sorted(UI.glob(f"*/{pkg}"))
    if not cands:
        print("skip (not found):", pkg)
        continue
    base = cands[0]
    manifest = json.loads((base / "package.json").read_text())
    files = []

    for f in sorted((base / "src").rglob("*.tsx")):
        rel = f.relative_to(base / "src")
        parts = rel.parts
        if len(parts) >= 2 and parts[0] == "components":
            seg = parts[1]
            if seg in TYPE_MAP:
                _, root = TYPE_MAP[seg]
                target = f"{root}/{rel.name}"
            else:  # the section component: components/<section>/<Section>.tsx
                target = rel.as_posix()
            ftype = "registry:component"
        elif len(parts) >= 2 and parts[0] == "lib":
            target = f"lib/{rel.name}"
            ftype = "registry:lib"
        else:
            continue
        files.append({
            "path": f"{pkg}/src/{rel.as_posix()}",
            "target": target,
            "type": ftype,
            "content": f.read_text(),
        })

    deps = sorted(k for k in manifest.get("peerDependencies", {}) if k not in EXCLUDED_PEER)
    item = {
        "$schema": "https://ui.shadcn.com/schema/registry-item.json",
        "name": pkg,
        "type": "registry:block",
        "title": section_name(pkg),
        "description": manifest.get("description", ""),
        "dependencies": deps,
        "registryDependencies": [],
        "files": files,
        "docs": f"Install, then render the main export ({section_name(pkg).replace(' ', '')}) with your props. See {pkg}/README.md in the repo.",
    }
    out = UI / "registry" / "r"
    out.mkdir(parents=True, exist_ok=True)
    (out / f"{pkg}.json").write_text(json.dumps(item, indent=2) + "\n")

index_items = []
for pkg in PACKAGES:
    item = json.loads((UI / "registry" / "r" / f"{pkg}.json").read_text())
    index_items.append({
        "name": item["name"],
        "type": item["type"],
        "title": item["title"],
        "description": item["description"],
        "dependencies": item["dependencies"],
        "registryDependencies": item["registryDependencies"],
        "files": [{"path": f["target"], "type": f["type"]} for f in item["files"]],
    })

index = {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "ui-presets",
    "homepage": "https://github.com/",
    "items": index_items,
}
(UI / "registry" / "registry.json").write_text(json.dumps(index, indent=2) + "\n")
print(f"generated {len(index_items)} registry items -> UI/registry/r/")
