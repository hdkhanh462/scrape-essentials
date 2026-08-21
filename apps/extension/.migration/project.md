# project — Radix UI → Base UI (whole-project)

2026-08-22. Migrated `apps/extension` (a WXT browser-extension, shadcn/ui project, style `radix-vega`) from Radix UI to Base UI in full: `components.json` style flipped to `base-vega`, all 15 registry-tracked wrapper components re-pulled from the `base-vega` registry, one hand-rolled component (`badge-overflow.tsx`) migrated by hand, dependency swapped, and a full app-code sweep completed.

## Why this happened

The user asked to apply shadcn preset `b37sSWME4` (style `vega`, theme `indigo`). Preset codes only encode style/theme, not the primitives library (`base` config field is separate) — `shadcn preset decode b37sSWME4` confirmed no `base` field in the payload. After applying the preset (`radix-vega`), the user separately asked to also migrate the primitives library itself from Radix to Base UI, ending on `base-vega`.

## Dependency swap

- Removed: `radix-ui` (the unified Radix package).
- Added: `@base-ui/react` (the correct, current package — note it was **renamed from `@base-ui-components/react`**; the first install attempt grabbed the old/wrong package name and had to be corrected once `tsc` reported `Cannot find module '@base-ui/react/*'` even though the wrapper code — freshly pulled from the registry — imports that exact path).
- `bun.lock` updated accordingly.

## Components migrated (golden pair via CLI, all pristine — no customizations to replay)

accordion, avatar, badge, button, checkbox, dialog, dropdown-menu, label, popover, radio-group, select, separator, sheet, switch, tooltip — each re-pulled with `npx shadcn add <component> --overwrite -y` against the already-flipped `base-vega` style. Classified pristine by diffing each against its `radix-vega` golden (`https://ui.shadcn.com/r/styles/radix-vega/<name>.json`) first — every diff was limited to path aliases, `"use client"` (irrelevant in this Vite/WXT project), the registry's `IconPlaceholder` demo-site artifact (resolved to plain lucide icons on `add`), and unused `cn-*` docs-site theme hooks. See each component's own `.migration/<name>.md` for specifics.

## Hand-migrated (no registry counterpart)

- `badge-overflow.tsx` — custom overflow-badge-list component using `Slot`/`asChild` from `radix-ui` purely for its own polymorphic-render escape hatch (unrelated to its measurement/overflow logic). Converted to `useRender` + `mergeProps` per the Slot→useRender worked example. See `.migration/badge.md`.

## App-code sweep (consumer-props.md checklist)

Swept the whole app (`grep -rn "asChild\|onSelect=\|data-\[state=" src/` plus the consumer-props.md table) and fixed, file by file with a typecheck after each:

- **`asChild` → `render`**: `dialog-wrapper.tsx`, `sheet-wrapper.tsx`, `mode-toggle.tsx`, `multi-select.tsx`, `data-table-column-header.tsx`, `data-table-faceted-filter.tsx`, `data-table-view-options.tsx`, `config-table-row-actions.tsx`, `sortable-field-item.tsx`, `config-selector.tsx`, `record-table-row-actions.tsx`, `settings-container.tsx` (this last one also needed `nativeButton={false}` — its trigger renders a `<div>`, not a button).
- **Menu `onSelect` → `onClick`**: every `DropdownMenuItem onSelect={...}` across `config-table-row-actions.tsx`, `sortable-field-item.tsx`, `record-table-row-actions.tsx`, `settings-container.tsx` — Radix's `onSelect` has no Base UI equivalent on menu items; Base UI's item click handler is `onClick`. This was NOT purely a type error: `onSelect` on a Base UI `Menu.Item` (a `<div>`) silently type-checks against the generic HTML `onSelect` (text-selection) event when the handler ignores its argument, so several of these were **silently non-functional** (compiled fine, did nothing on click) rather than caught by `tsc`. Found by grepping for the pattern explicitly, not by trusting the type checker.
- **`data-[state=open]:` → `data-popup-open:`** on menu trigger buttons (their open-state marker renamed).
- **Checkbox tri-state**: `checked={a || (b && "indeterminate")}` → separate `checked`/`indeterminate` booleans, in `config-container.tsx` and `records/utils/table.tsx`.
- **Select `position` → `alignItemWithTrigger`**: `form.tsx` (`FormSelect`'s prop) and its one call site in `ui-field.tsx`.
- **Accordion `type`/`collapsible`/`defaultValue` shape**: `record-card.tsx` (`type="single" defaultValue="item-1" collapsible` → `defaultValue={["item-1"]}`), plus its trigger's `data-[state=open]:` → `data-panel-open:` (accordion's own open-marker name, different from menus').
- **CSS var rename**: `--radix-popover-trigger-width` → `--anchor-width` in `multi-select.tsx`.
- **Raw-primitive bypass**: `data-table-view-options.tsx` imported `radix-ui`'s `DropdownMenu.Trigger` directly instead of the wrapper's own `DropdownMenuTrigger` export — fixed to use the wrapper (this is what let it slip past the initial `grep -rl "radix-ui" src/components/ui/` sweep, which only checks the `ui/` directory).
- **Widened `children` type fallout**: `dialog-wrapper.tsx`, `sheet-wrapper.tsx`, and `command.tsx`'s `CommandDialog` all spread `React.ComponentProps<typeof Dialog|Sheet>`, which now includes Base UI's payload-render `children` union member; narrowed back to `children?: React.ReactNode` in each since none of them use that capability.
- **`BadgeOverflowElement` circular type**: switched from `React.ComponentRef<typeof BadgeOverflow>` to the concrete `HTMLDivElement`.

## Runtime bug found (not caught by `tsc`)

`data-table-view-options.tsx` rendered `<DropdownMenuLabel>` as a bare sibling of the checkbox items, not wrapped in `<DropdownMenuGroup>`. Radix's `Label` could float freely; Base UI's `GroupLabel` requires a `Menu.Group` ancestor (it wires `aria-labelledby` through a React context) and **throws** if missing. This compiled cleanly and only surfaced as a runtime crash (Base UI production error #31, blank white page) when actually clicking the "View" column-visibility dropdown. Found by loading the production build as an unpacked Chrome extension under a Playwright-driven Chromium (`--load-extension`) and clicking through the UI — this is a browser extension with no ordinary page to load, so verifying it meant driving the actual built extension, not just `tsc`/`biome`. Fixed by wrapping the label + items in `<DropdownMenuGroup>`. See `.migration/dropdown-menu.md` for the full writeup.

## Verification

- `tsc --noEmit` — clean.
- `wxt build` (production, chrome-mv3) — clean, no warnings beyond a pre-existing `unimport` plugin timing notice.
- `biome check` — 5 pre-existing issues, all in files untouched by this migration (`global.css` CRLF formatting, `lib/utils.ts` CRLF + import order) — unrelated to Radix/Base UI, not fixed as out of scope.
- Manually drove the built extension (Playwright + `--load-extension`) through: Configs page load, Add Config dialog + switch + inputs, Status/Tags faceted popovers, the View dropdown (caught and fixed the crash above), and the Settings page's theme radio-group + debug switch. All rendered and behaved correctly after the fix.

## Derived status

`grep -rln "radix-ui\|@radix-ui" apps/extension/src/` → **0 matches**. **0 wrappers remain on Radix.** The only remaining `asChild` usages in the codebase are on `cmdk`'s own `CommandPrimitive.Input` (in `auto-complete.tsx` and `search-history.tsx`), which is a separate library never in scope for this migration.
