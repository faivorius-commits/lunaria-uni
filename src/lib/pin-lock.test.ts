import { describe, expect, it } from "vitest";
import { ensureRecord, makeRecord, verifyPin, isValidPin, readRecord } from "./pin-lock";

function mem(): Storage {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), clear: () => m.clear(), key: () => null, get length() { return m.size; } };
}

describe("app lock", () => {
  it("starts with PIN 1440 on a new device", async () => {
    const s = mem();
    const rec = await ensureRecord(s);
    expect(await verifyPin("1440", rec)).toBe(true);
    expect(await verifyPin("0000", rec)).toBe(false);
  });
  it("never stores the PIN in plain text", async () => {
    const s = mem();
    await ensureRecord(s);
    expect(JSON.stringify(readRecord(s))).not.toContain("1440");
  });
  it("accepts a changed PIN and rejects the old one", async () => {
    const rec = await makeRecord("2468");
    expect(await verifyPin("2468", rec)).toBe(true);
    expect(await verifyPin("1440", rec)).toBe(false);
  });
  it("requires 4 to 8 digits", () => {
    expect(isValidPin("123")).toBe(false);
    expect(isValidPin("1440")).toBe(true);
    expect(isValidPin("12a4")).toBe(false);
  });
});
