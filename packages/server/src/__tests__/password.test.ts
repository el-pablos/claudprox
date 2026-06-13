import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password";

describe("hashPassword / verifyPassword", () => {
  it("hash bukan plaintext dan terverifikasi benar", async () => {
    const plain = "ClaudProxAdmin#2026";
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(await verifyPassword(plain, hash)).toBe(true);
  });

  it("password salah gagal verifikasi", async () => {
    const hash = await hashPassword("benar123");
    expect(await verifyPassword("salah123", hash)).toBe(false);
  });

  it("hash memakai bcrypt cost 12", async () => {
    const hash = await hashPassword("x");
    // Format bcrypt: $2b$12$... -> cost ada di segmen ketiga.
    expect(hash.split("$")[2]).toBe("12");
  });

  it("menolak password kosong saat hashing", async () => {
    await expect(hashPassword("")).rejects.toThrow();
  });

  it("verifyPassword false bila input kosong", async () => {
    expect(await verifyPassword("", "$2b$12$abcdef")).toBe(false);
  });
});
