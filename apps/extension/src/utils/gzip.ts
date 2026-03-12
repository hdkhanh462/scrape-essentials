import Pako from "pako";

export function gzipJSON(data: object): Blob {
  const json = JSON.stringify(data);
  const compressed = Pako.gzip(json);
  return new Blob([compressed], { type: "application/gzip" });
}

export function ungzipJSON<T>(buffer: ArrayBuffer): T {
  const uint8 = new Uint8Array(buffer);

  const json = Pako.ungzip(uint8, { to: "string" });

  return JSON.parse(json) as T;
}
