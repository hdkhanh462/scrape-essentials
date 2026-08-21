# popover

2026-08-22, golden pair via CLI (`shadcn add popover --overwrite`), pristine wrapper — positioner model (Portal > Positioner > Popup); three consumers fixed for `asChild` → `render` and one CSS var rename.

## Changed

- `src/components/ui/popover.tsx` — replaced with the `base-vega` registry variant. `Content` split into `Portal > Positioner > Popup`; `Anchor` part dropped (no Base UI equivalent — Positioner accepts an `anchor` prop instead, unused here). Leftover scan clean.
- `src/components/data-table/data-table-faceted-filter.tsx` — `<PopoverTrigger asChild><Button>...</Button></PopoverTrigger>` → `<PopoverTrigger render={<Button>...</Button>} />` (the button's large children block — icon, title, badge list — moved into the `render` element unchanged).
- `src/components/ui/multi-select.tsx` — `MultiSelectTrigger`: same `asChild` → `render` fix. Also `MultiSelectContent`: `min-w-[var(--radix-popover-trigger-width)]` → `min-w-[var(--anchor-width)]` (Radix's `--radix-popover-trigger-width` CSS var → Base UI's `--anchor-width`, set on the Positioner by the migrated wrapper).
- `src/features/records/components/config-selector.tsx` — same `asChild` → `render` fix on the config-picker trigger button.

## Left alone

`CommandItem onSelect` inside the Popover's `Command` content (faceted filter, multi-select, config-selector) is `cmdk`'s own event, not Radix/Base UI's — left untouched.

## Behavior changes

None observed.

## Verify by hand

Open the Configs table's faceted "Status"/"Tags" filter popovers, the multi-select field editor, and the Records page's config-selector dropdown — confirm each opens anchored correctly under its trigger, sized to (or wider than) the trigger's width, and closes on outside click / Escape.
