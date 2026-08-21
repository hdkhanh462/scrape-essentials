# sheet

2026-08-22, golden pair via CLI (`shadcn add sheet --overwrite`), pristine wrapper — built on the same Dialog primitive as `dialog.tsx`; one consumer fixed for `asChild` → `render` and the widened `children` type.

## Changed

- `src/components/ui/sheet.tsx` — replaced with the `base-vega` registry variant (Sheet is a styled composition over `@base-ui/react/dialog`, same as dialog.tsx: Overlay→Backdrop, Content→Popup, slide animations rewritten from `animate-in`/`animate-out` to `data-starting-style`/`data-ending-style` with per-side translate). Close icon resolved to lucide directly; `cn-font-heading` companion class skipped (plain `font-heading` kept, not using the docs-site cn-* theme system). Leftover scan clean.
- `src/components/sheet-wrapper.tsx` — same fix as `dialog-wrapper.tsx`: `<SheetTrigger asChild>{trigger}</SheetTrigger>` → `<SheetTrigger render={trigger as React.ReactElement} />`, and `Props` narrowed to `Omit<React.ComponentProps<typeof Sheet>, "children"> & DialogWrapperProps & { children?: React.ReactNode }` to undo Base UI's widened payload-render `children` type.

## Left alone

Nothing else consumes Sheet directly.

## Behavior changes

None observed — slide-in/out animation timing and direction (`side="right"` default) look the same; only the underlying animation mechanism changed (CSS transitions via starting/ending-style instead of keyframe classes), which is invisible to users.

## Verify by hand

Open a sheet (e.g. via `SheetWrapper` usage) — confirm it slides in from the correct edge, the backdrop dims the page, and closing (Escape, backdrop click, or Close button) slides it back out rather than disappearing abruptly.
