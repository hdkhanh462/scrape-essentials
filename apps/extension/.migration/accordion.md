# accordion

2026-08-22, golden pair via CLI (`shadcn add accordion --overwrite`), pristine wrapper — clean swap to Base UI, one consumer updated for the new value-array API.

## Changed

- `src/components/ui/accordion.tsx` — replaced wholesale with the `base-vega` registry variant (`npx shadcn add accordion --overwrite`). Root/Item/Header/Trigger unchanged in shape; `Content` → `Panel`; chevron icons resolved to lucide directly (registry's `IconPlaceholder` is a docs-site-only artifact, not carried over). Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/accordion.tsx` → no matches.
- `src/features/records/components/record-card.tsx:212` — `<Accordion type="single" defaultValue="item-1" collapsible>` → `<Accordion defaultValue={["item-1"]}>` (Base UI drops `type`/`collapsible`; `value`/`defaultValue` are always arrays; single mode is always collapsible). `AccordionTrigger` class `data-[state=open]:pb-4!` → `data-panel-open:pb-4!` (accordion's Trigger uses `data-panel-open`, not `data-open`, per the mapping table).

## Left alone

Nothing else in the app renders `<Accordion>` (grep confirmed only `record-card.tsx`).

## Behavior changes

None observed — single-mode collapsible behavior is preserved by default in Base UI.

## Verify by hand

Open a record card, click the "Scraped data" accordion trigger to expand/collapse; confirm the chevron flips and the panel height-animates smoothly (no snap/jump), and that it can be collapsed back to fully closed.
