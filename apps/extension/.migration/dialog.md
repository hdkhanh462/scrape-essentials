# dialog

2026-08-22, golden pair via CLI (`shadcn add dialog --overwrite`), pristine wrapper — restructured (Overlay→Backdrop, Content→Popup); two consumers fixed for `asChild` → `render` and a widened `children` type.

## Changed

- `src/components/ui/dialog.tsx` — replaced with the `base-vega` registry variant. `Overlay` → `Backdrop`, `Content` → `Popup` (centered modal, no Positioner), `Close` kept. Close icon resolved to lucide directly; `font-heading` class kept as plain Tailwind (registry's `cn-font-heading` companion class is for the shadcn docs-site theme system, not used here). Leftover scan clean.
- `src/components/dialog-wrapper.tsx` — `<DialogTrigger asChild>{trigger}</DialogTrigger>` → `<DialogTrigger render={trigger as React.ReactElement} />`. Also: `Props` was `React.ComponentProps<typeof Dialog> & DialogWrapperProps`, which now inherits Base UI `Dialog.Root`'s widened `children` type (`ReactNode | PayloadChildRenderFunction<unknown>`, from Base UI's detached-trigger/handle machinery) — narrowed back to `children?: React.ReactNode` via `Omit<..., "children"> & { children?: React.ReactNode }` since this wrapper never uses the payload-render form.
- `src/components/ui/command.tsx:36-48` (`CommandDialog`, not itself a Radix consumer — cmdk-based) — hit the same widened-`children` fallout since it spreads `React.ComponentProps<typeof Dialog>`; applied the same `Omit<..., "children"> & { children?: React.ReactNode }` narrowing.

## Left alone

`command.tsx`'s own primitive (`cmdk`) is untouched — only its `Dialog` composition needed the type fix above.

## Behavior changes

None observed in the modal's open/close/focus-trap behavior; the payload-render `children` capability (new in Base UI) is simply unused, not removed.

## Verify by hand

Open any dialog in the app (e.g. a config's "Are you sure" confirm dialog, or the Command Palette if bound) — confirm the backdrop dims the background, the popup is centered and traps focus, Escape and the Close (X) button both close it, and focus returns to the trigger afterward.
