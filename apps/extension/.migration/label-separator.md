# label / separator

2026-08-22, golden pair via CLI (`shadcn add label --overwrite`, `shadcn add separator --overwrite`), both pristine wrappers, no consumer changes needed.

## Changed

- `src/components/ui/label.tsx` — replaced with the `base-vega` registry variant. Radix's `Label.Root` has no Base UI counterpart (per the mapping tables); the base registry wrapper renders a native `<label>` directly instead. Leftover scan clean.
- `src/components/ui/separator.tsx` — replaced with the `base-vega` registry variant. `Separator.Root` → the callable `Separator` single-part primitive; `decorative` prop dropped (Base UI's separator is always semantic, `role="separator"`) — not used by this wrapper or any consumer. Leftover scan clean.

## Left alone

No consumer passed `decorative` on `<Separator>`, so no behavior to preserve or flag.

## Behavior changes

None.

## Verify by hand

Confirm form field labels still associate correctly with their inputs (click a label, focus should move to its input), and that visual separators (e.g. between the faceted-filter's selected badge and count, or in dropdown menus) still render as thin dividing lines.
