# badge / badge-overflow

2026-08-22, `badge.tsx` via golden pair (CLI); `badge-overflow.tsx` (custom, non-registry) hand-migrated with the `useRender` + `mergeProps` engine per the Slot worked example.

## Changed

- `src/components/ui/badge.tsx` — replaced with the `base-vega` registry variant (Slot/`asChild` → `useRender`/`render` internally). No consumer call sites passed `asChild`, so no sweep needed. Leftover scan clean.
- `src/components/ui/badge-overflow.tsx` — hand-rolled component using `Slot as SlotPrimitive` from `radix-ui` purely for its own `asChild` passthrough (`items`/`renderBadge`/measurement logic is unrelated to Radix). Rewritten:
  - `import { Slot as SlotPrimitive } from "radix-ui"` → `import { mergeProps } from "@base-ui/react/merge-props"` + `import { useRender } from "@base-ui/react/use-render"`.
  - Prop type `React.ComponentProps<"div"> & { ...; asChild?: boolean }` → `useRender.ComponentProps<"div"> & { ... }` (drops `asChild`, gains `render` from the base type).
  - The old two-branch (`isMeasured ? <Comp>...</Comp> : <Comp>...</Comp>`) JSX was collapsed into plain-JS `rootStyle`/`rootChildren` computed once, then a single `useRender({ defaultTagName: "div", render, ref: composedRef, props: mergeProps(...) })` call — calling `useRender` conditionally per branch would have violated the rules of hooks once `isMeasured` flips after the initial measurement effect.
  - `BadgeOverflowElement` type: was `React.ComponentRef<typeof BadgeOverflow>` (self-referential through the component's own return type), which became a **circular type reference** once the return type depended on `useRender`'s generic inference. Changed to the concrete `HTMLDivElement`, since the root always renders a `<div>` by default.
  - Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/badge-overflow.tsx` → no matches.

## Left alone

Nothing else touches Badge; `config-container.tsx` and `records/utils/table.tsx` consume `BadgeOverflow` with plain props (`items`, `renderBadge`, `getBadgeLabel`) — no `asChild` usage there.

## Behavior changes

None — `render` is a drop-in replacement for the unused `asChild` escape hatch; no caller exercised it.

## Verify by hand

On the Configs and Records tables, check the Domains/Tags/Config-fields badge lists: badges should wrap correctly, and when they overflow, the "+N" badge should render (with its tooltip listing the hidden items on hover) instead of the raw list.
