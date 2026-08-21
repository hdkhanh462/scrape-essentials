# tooltip

2026-08-22, golden pair via CLI (`shadcn add tooltip --overwrite`), pristine wrapper — positioner model, no consumer call-site changes needed.

## Changed

- `src/components/ui/tooltip.tsx` — replaced with the `base-vega` registry variant. `Content` → `Portal > Positioner > Popup`; Provider `delayDuration` → `delay` (internal to the wrapper's `TooltipProvider`, not exposed differently to consumers); default `sideOffset` 0 → 4. Leftover scan clean.

## Left alone

No consumer in this app passes `delayDuration`, `skipDelayDuration`, or `disableHoverableContent` — all usages are plain `<Tooltip><TooltipTrigger>...</TooltipTrigger><TooltipContent>...</TooltipContent></Tooltip>` with no extra props, so nothing needed sweeping.

## Behavior changes

None expected to be visible; the default open-delay feel may shift slightly (Radix default `delayDuration` 700ms vs. Base UI Trigger default `delay` 600ms) since neither side set it explicitly.

## Verify by hand

Hover over the "+N" overflow badge (badge-overflow's tooltip) and any icon-only buttons with tooltips — confirm the tooltip appears near the trigger after a short hover delay, positioned correctly (arrow pointing at the trigger), and disappears on mouse-out.
