export function driveApiUrl(
  path: string,
  params?: Record<string, string | number | boolean>,
) {
  const base = new URL(`https://www.googleapis.com/drive/v3/${path}`);

  if (!params) return base;

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    search.append(key, String(value));
  }

  return `${base}?${search.toString()}`;
}
