# select

2026-08-22, golden pair via CLI (`shadcn add select --overwrite`), pristine wrapper — restructured (Content split into Portal/Positioner/Popup, `Viewport`→`List`, `ScrollUp/DownButton`→`ScrollUp/DownArrow`); two consumers fixed for the `position` → `alignItemWithTrigger` prop rename.

## Changed

- `src/components/ui/select.tsx` — replaced with the `base-vega` registry variant. `position="popper"|"item-aligned"` dropped entirely in favor of `alignItemWithTrigger` (boolean, default `true`) exposed on `SelectContent`, picked from `Positioner.Props`; icons resolved to lucide directly; `cn-menu-target`/`cn-menu-translucent` companion classes skipped (unused docs-site theme hooks). Leftover scan clean.
- `src/components/form.tsx` (`FormSelect`) — `FormSelectProps.position?: "popper" | "item-aligned"` → `alignItemWithTrigger?: boolean`; `<SelectContent position={inputProps?.position}>` → `<SelectContent alignItemWithTrigger={inputProps?.alignItemWithTrigger}>`.
- `src/features/records/components/ui-field.tsx:65` — the one call site passing `position: "popper"` (for the `InputSelect` field-type editor) → `alignItemWithTrigger: false` (Radix's `"popper"` mode is Base UI's `alignItemWithTrigger={false}`).

## Left alone

Nothing else consumes `FormSelect`'s `position` option or `SelectContent` directly with non-default positioning.

## Behavior changes

None observed for default usage; the one `alignItemWithTrigger={false}` call site preserves its prior "popper" (viewport-anchored, not item-aligned) positioning behavior.

## Verify by hand

Open a config field editor with an `InputSelect` field type — confirm the dropdown opens anchored to the trigger (not item-aligned to the selected option), and that selecting an option updates the field and closes the menu.
