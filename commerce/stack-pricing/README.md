# StackPricing

Website/webapp section built with the **layer-stack architecture** (the "sandwich" pattern):
every part of the composition is its own exported component in `src/components/stack-pricing/layers/`, and the
composed section (`StackPricing`) imports the layers and stacks them.

- **The layers** — each one standalone: props in, visual layer out
- **The stack** — composed section with entrance choreography + interaction
- **Reuse** — import layers directly to build your own composition; repeat the fillings freely
- **Tokens** — shadcn token set only (fixed ingredient/product colors are documented content data)
