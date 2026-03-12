export function shouldBackup() {
  const last = localStorage.getItem("last_backup");

  if (!last) return true;

  const diff = Date.now() - Number(last);

  return diff > 24 * 60 * 60 * 1000;
}
