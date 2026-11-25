// Local convenience lock. Only a salted SHA-256 hash is stored on this device.
export const DEFAULT_PIN = "1440"; // initial PIN requested by the owner; users are asked to change it
const KEY = "lunaria.lock.v1";

export type LockRecord = { salt: string; hash: string; enabled: boolean; isDefault: boolean };

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isValidPin(pin: string) {
  return /^\d{4,8}$/.test(pin);
}

function randomSalt() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function makeRecord(pin: string, enabled = true, isDefault = false): Promise<LockRecord> {
  const salt = randomSalt();
  return { salt, hash: await hashPin(pin, salt), enabled, isDefault };
}

export function readRecord(storage: Storage = localStorage): LockRecord | null {
  try {
    const raw = storage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LockRecord) : null;
  } catch {
    return null;
  }
}

export function writeRecord(rec: LockRecord, storage: Storage = localStorage) {
  storage.setItem(KEY, JSON.stringify(rec));
}

export async function ensureRecord(storage: Storage = localStorage): Promise<LockRecord> {
  const existing = readRecord(storage);
  if (existing) return existing;
  const rec = await makeRecord(DEFAULT_PIN, true, true);
  writeRecord(rec, storage);
  return rec;
}

export async function verifyPin(pin: string, rec: LockRecord) {
  return (await hashPin(pin, rec.salt)) === rec.hash;
}
