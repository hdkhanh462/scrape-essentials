# dropdown-menu

2026-08-22, golden pair via CLI (`shadcn add dropdown-menu --overwrite`), pristine wrapper — Radix `DropdownMenu` → Base UI `Menu` (renamed + restructured). Widest consumer blast radius of the migration: every trigger's `asChild`, every item's `onSelect`, and one runtime crash from a Base UI structural invariant Radix didn't enforce.

## Changed

- `src/components/ui/dropdown-menu.tsx` — replaced with the `base-vega` registry variant. Canonical menu mapping applied: `Label` → `GroupLabel`, `ItemIndicator` → `CheckboxItemIndicator`/`RadioItemIndicator` (split), `Sub` → `SubmenuRoot`, `SubTrigger` → `SubmenuTrigger`, `Content` → `Portal > Positioner > Popup`. Icons resolved to lucide directly; `cn-menu-target`/`cn-menu-translucent`/`cn-rtl-flip` companion classes skipped (docs-site theme system / RTL, both unused here — `rtl: false` in `components.json`). Leftover scan clean.
- `src/components/data-table/data-table-view-options.tsx` — this file bypassed the wrapper entirely, importing `{ DropdownMenu as DropdownMenuPrimitive } from "radix-ui"` and pulling `.Trigger` off it directly instead of using the wrapper's own `DropdownMenuTrigger` export. Fixed to import `DropdownMenuTrigger` from `@/components/ui/dropdown-menu` like every other consumer, and `asChild` → `render`.
  - **Runtime crash (Base UI error #31), found by manually driving the built extension in a Playwright-controlled Chromium with the unpacked build loaded (not part of the normal test suite — this is a browser extension with no page to visit, so it had to be loaded via `--load-extension`):** this file renders `<DropdownMenuLabel>` as a bare sibling of `<DropdownMenuCheckboxItem>` items, not wrapped in `<DropdownMenuGroup>`. Radix's `Label` could float freely with no parent; Base UI's `GroupLabel` reads a group-registration context via `useContext` that only `Menu.Group` provides, and throws if that context is `undefined` (production error #31, "must be used within a `Menu.Group`"). Every click on the "View" (column-visibility) dropdown crashed the whole options page to a blank white screen. Fixed by wrapping the label, separator, and checkbox items in `<DropdownMenuGroup>`.
- `src/components/mode-toggle.tsx` — `asChild` → `render` on the trigger.
- `src/features/configs/components/config-table-row-actions.tsx` — `asChild` → `render`; `data-[state=open]:bg-muted` → `data-popup-open:bg-muted` (trigger's open-state marker renamed); all four `DropdownMenuItem onSelect={...}` → `onClick={...}` (Radix `onSelect` → Base UI `onClick`); `handleCopyConfig` signature `(_e: Event) => ...` → `() => ...` since it no longer receives (or needs) the native `Event`.
- `src/features/configs/components/sortable-field-item.tsx` — `asChild` → `render` on the trigger; the one item still using `onSelect={editFieldDialog.open}` → `onClick={editFieldDialog.open}` (a sibling item in the same file already used `onClick`, so this menu was inconsistent even before the migration — the `onSelect` one was silently non-functional under Base UI's native `<div>`-level `onSelect` DOM event, which doesn't fire on click).
- `src/features/records/components/record-table-row-actions.tsx` — same pattern as `config-table-row-actions.tsx`: `asChild` → `render`, `data-[state=open]:bg-muted` → `data-popup-open:bg-muted`, all three `onSelect` → `onClick`.
- `src/features/settings/components/settings-container.tsx` — trigger renders a plain `<div>` (the account row), not a `<Button>`: `asChild` → `render` + explicit `nativeButton={false}` (per the migration note for non-button `render` targets); `onSelect={handleDisconnect}` → `onClick={handleDisconnect}`.

## Left alone

`command.tsx`'s `CommandItem` `onSelect` usages (in `auto-complete.tsx`, `data-table-faceted-filter.tsx`, `multi-select.tsx`, `config-selector.tsx`, `search-history.tsx`) are `cmdk`'s own `onSelect`, unrelated to Radix/Base UI — verified each file imports `CommandItem` from `@/components/ui/command`, not `DropdownMenuItem`, before leaving it untouched.

## Behavior changes

- `closeOnClick` defaults to `false` on Base UI `CheckboxItem`/`RadioItem` (Radix closed the menu on select by default). Not present in this app's usage (no dropdown checkbox/radio items in the actual component tree), but flagged per the skill's guidance in case one is added later — add `closeOnClick` explicitly if Radix-matching auto-close is wanted.

## Verify by hand

1. On the Configs table, click "View" — confirm the column-visibility dropdown opens (previously crashed the page to blank white) and toggling a column checkbox actually hides/shows that column.
2. Click a row's "⋯" actions menu (Configs and Records tables) — confirm Edit/Copy/Duplicate/Delete items all fire their action on click, not just visually highlight.
3. On Settings, with a Google account connected, open the account dropdown and click Disconnect — confirm it fires (this trigger renders a `<div>`, exercising the `nativeButton={false}` path).
4. Click the sortable field's "⋯" menu in a config's field list — confirm both Edit and Delete fire.
