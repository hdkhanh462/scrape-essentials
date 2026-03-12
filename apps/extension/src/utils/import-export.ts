type ExportParams = {
  blob: Blob;
  prefix: string;
};

export async function exportBlob({ blob, prefix }: ExportParams) {
  const version = import.meta.env.VITE_APP_VERSION || "1";
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `${prefix}_v${version}_${date}.json`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromJSON(onChange: (file: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    onChange(file);
  };
  input.click();
}
