import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import {
  API_KEY_PREFIX,
  hashApiKey,
  deriveKeyPrefix,
  generateApiKey,
} from "../apiKey";

const SECRET = "test-secret-abc";

describe("hashApiKey", () => {
  // KONTRAK KRITIKAL: hash WAJIB identik dengan gateway
  // (apps/gateway/src/middleware/apiKeyAuth.ts -> sha256(key + secret)).
  it("memakai formula sha256(key + secret) yang sama dengan gateway", () => {
    const key = "cpx_live_deadbeef";
    const expected = createHash("sha256").update(`${key}${SECRET}`).digest("hex");
    expect(hashApiKey(key, SECRET)).toBe(expected);
  });

  it("deterministik untuk input yang sama", () => {
    expect(hashApiKey("abc", SECRET)).toBe(hashApiKey("abc", SECRET));
  });

  it("berbeda bila secret berbeda", () => {
    expect(hashApiKey("abc", "s1")).not.toBe(hashApiKey("abc", "s2"));
  });
});

describe("generateApiKey", () => {
  it("menghasilkan plaintext berawalan cpx_live_", () => {
    const { plaintext } = generateApiKey(SECRET);
    expect(plaintext.startsWith(API_KEY_PREFIX)).toBe(true);
  });

  it("keyHash konsisten dengan hashApiKey(plaintext)", () => {
    const { plaintext, keyHash } = generateApiKey(SECRET);
    expect(keyHash).toBe(hashApiKey(plaintext, SECRET));
  });

  it("keyPrefix adalah potongan awal plaintext", () => {
    const { plaintext, keyPrefix } = generateApiKey(SECRET);
    expect(plaintext.startsWith(keyPrefix)).toBe(true);
    expect(keyPrefix).toBe(deriveKeyPrefix(plaintext));
  });

  it("menghasilkan key acak yang berbeda tiap panggilan", () => {
    const a = generateApiKey(SECRET);
    const b = generateApiKey(SECRET);
    expect(a.plaintext).not.toBe(b.plaintext);
    expect(a.keyHash).not.toBe(b.keyHash);
  });

  it("menolak secret kosong", () => {
    expect(() => generateApiKey("")).toThrow();
  });
});
