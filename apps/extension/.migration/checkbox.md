# checkbox

2026-08-22, golden pair via CLI (`shadcn add checkbox --overwrite`), pristine wrapper — direct 1:1 swap; two consumers fixed for the split `checked`/`indeterminate` API.

## Changed

- `src/components/ui/checkbox.tsx` — replaced with the `base-vega` registry variant. Root/Indicator map 1:1 (cleanest primitive pair per the mapping tables); check icon resolved to lucide directly. Leftover scan clean.
- `src/features/configs/components/config-container.tsx:44-49` — header "select all" checkbox used the Radix tri-state idiom `checked={allSelected || (someSelected && "indeterminate")}`. Base UI split this into two props: `checked={table.getIsAllPageRowsSelected()}` + `indeterminate={table.getIsSomePageRowsSelected()}`.
- `src/features/records/utils/table.tsx:69-74` — same fix, same pattern, for the records table's header checkbox.

## Left alone

Per-row checkboxes in both tables already passed a plain boolean `checked={row.getIsSelected()}` — no change needed there.

## Behavior changes

None — the indeterminate visual state is preserved, just expressed as a separate boolean instead of a third `checked` value.

## Verify by hand

On the Configs and Records tables: select a few rows and confirm the header checkbox shows the indeterminate (dash) state; select all rows and confirm it shows fully checked; deselect all and confirm unchecked.
