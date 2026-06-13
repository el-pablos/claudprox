// Utilitas password berbasis bcrypt.
// Cost 12 sesuai ENGINEERING.md (hardening: bcrypt cost >= 12).

import bcrypt from "bcrypt";

const BCRYPT_COST = 12;

/** Hash password plaintext. */
export async function hashPassword(plain: string): Promise<string> {
  if (plain === "") {
    throw new Error("password tidak boleh kosong");
  }
  return bcrypt.hash(plain, BCRYPT_COST);
}

/** Verifikasi password plaintext terhadap hash tersimpan. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (plain === "" || hash === "") {
    return false;
  }
  return bcrypt.compare(plain, hash);
}
