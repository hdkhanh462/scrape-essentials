# switch

2026-08-22, golden pair via CLI (`shadcn add switch --overwrite`), pristine wrapper — direct 1:1 swap, no consumer changes needed.

## Changed

- `src/components/ui/switch.tsx` — replaced with the `base-vega` registry variant. `Root`/`Thumb` map 1:1; Root renders `<span>` + hidden `<input>` instead of a native `<button>` + hidden input in forms, but this is invisible at the wrapper/consumer level. Leftover scan clean.

## Left alone

Consumers (`Add Config`'s "Active" toggle, Settings' "Debug mode" toggle) pass only `checked`/`onCheckedChange` — no dropped props were in use.

## Behavior changes

None observed.

## Verify by hand

Toggle the "Active" switch on the Add/Edit Config form and the "Debug mode" switch on Settings — confirm the thumb slides and the checked state persists/reflects correctly.
