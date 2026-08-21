# radio-group

2026-08-22, golden pair via CLI (`shadcn add radio-group --overwrite`), pristine wrapper — restructured (single Radix namespace split into Base UI `RadioGroup` + `Radio`); no consumer changes needed.

## Changed

- `src/components/ui/radio-group.tsx` — replaced with the `base-vega` registry variant. `RadioGroup.Item` → `Radio.Root`, `RadioGroup.Indicator` → `Radio.Indicator` (moved to a separate `Radio` subpath, composed inside the same public `RadioGroupItem` wrapper export so the public API is unchanged). Leftover scan clean.

## Left alone

The Settings page's theme picker (`Light`/`Dark`/`System`) uses `RadioGroup`/`RadioGroupItem` with only `value`/`defaultValue`/`onValueChange` — none of the dropped props (`orientation`, `dir`, `loop`) were in use, so no call-site changes were needed.

## Behavior changes

None observed.

## Verify by hand

On the Settings page, click each of Light/Dark/System — confirm the radio dot moves to the clicked option, the row highlights, and the app's theme actually changes accordingly.
