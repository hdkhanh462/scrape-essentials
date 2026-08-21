# avatar

2026-08-22, golden pair via CLI (`shadcn add avatar --overwrite`), pristine wrapper — direct 1:1 swap, no consumer changes needed.

## Changed

- `src/components/ui/avatar.tsx` — replaced with the `base-vega` registry variant. `Avatar.Root`/`Avatar.Image`/`Avatar.Fallback` map 1:1 (Root renders `<span>`, Image `<img>`, Fallback `<span>`); no prop or class changes at the wrapper level. Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/avatar.tsx` → no matches.

## Left alone

Consumers (`settings-container.tsx`) pass only `src`/children — no radix-specific props (`asChild`, `delayMs`) were in use, so no call-site changes were required.

## Behavior changes

None.

## Verify by hand

On the Settings page, check the Google account avatar renders the profile picture when signed in, and falls back gracefully (no broken image) when signed out or the image fails to load.
