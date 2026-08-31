# StackFund

Composable **layer-stack** section (the "sandwich" architecture): every part is its own exported
component in `src/components/*/layers/`, and the composed `StackFund` imports and stacks them.

- **Layers** — use standalone, or repeat the fillings (`×` rows) as many times as you need
- **Stack** — entrance choreography + interaction (selection / confirm states where relevant)
- **Tokens** — shadcn token set only; focus-visible, `prefers-reduced-motion`, aria roles on interactive fillings
