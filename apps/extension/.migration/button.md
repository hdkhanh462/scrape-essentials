# button

2026-08-22, golden pair via CLI (`shadcn add button --overwrite`), pristine wrapper — migrated to the real Base UI `Button` primitive.

## Changed

- `src/components/ui/button.tsx` — replaced with the `base-vega` registry variant, which imports the real `@base-ui/react/button` primitive (`import { Button as ButtonPrimitive } from "@base-ui/react/button"`) rather than a hand-rolled `Slot`/`useRender` wrapper, per the hard rule that button.tsx must use Base UI's own Button. `asChild` is gone; `Button` now accepts `render` directly (inherited from the primitive). Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/button.tsx` → no matches.

## Left alone

Nothing — Button itself needed no further changes; every call site that used `asChild` on OTHER wrappers (DropdownMenuTrigger, PopoverTrigger, DialogTrigger, SheetTrigger, etc.) rendering a `<Button>` was fixed as part of sweeping those respective wrappers' consumers (see dropdown-menu.md, popover.md, dialog.md, sheet.md).

## Behavior changes

None beyond the universal `asChild` → `render` prop rename at call sites.

## Verify by hand

Click a handful of buttons across the app (primary, ghost, outline, destructive variants) to confirm styling, hover/focus rings, and disabled states all look correct.
