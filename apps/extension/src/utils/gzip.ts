import Pako from "pako";

export function gzipJSON(data: object) {
  const json = JSON.stringify(data);
  const compressed = Pako.gzip(json);
  return new Blob([compressed], { type: "application/gzip" });
}

export function ungzipJSON(buffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(buffer);

  const json = Pako.ungzip(uint8, { to: "string" });

  return JSON.parse(json);
}
