import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  isAdmin,
  type SessionPayload,
} from "../auth";

const SECRET = "jwt-test-secret";
const userPayload: SessionPayload = {
  sub: "user_1",
  email: "user@tams.codes",
  role: "USER",
};
const adminPayload: SessionPayload = {
  sub: "admin_1",
  email: "admin@tams.codes",
  role: "ADMIN",
};

describe("signAccessToken / verifyToken", () => {
  it("round-trip access token mengembalikan payload yang sama", () => {
    const token = signAccessToken(userPayload, SECRET);
    const decoded = verifyToken(token, SECRET);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe(userPayload.sub);
    expect(decoded?.email).toBe(userPayload.email);
    expect(decoded?.role).toBe("USER");
  });

  it("round-trip refresh token juga valid", () => {
    const token = signRefreshToken(adminPayload, SECRET);
    const decoded = verifyToken(token, SECRET);
    expect(decoded?.role).toBe("ADMIN");
  });

  it("menolak token dengan secret salah", () => {
    const token = signAccessToken(userPayload, SECRET);
    expect(verifyToken(token, "secret-lain")).toBeNull();
  });

  it("menolak token sampah", () => {
    expect(verifyToken("bukan.token.valid", SECRET)).toBeNull();
  });
});

describe("isAdmin", () => {
  it("true untuk role ADMIN", () => {
    expect(isAdmin(adminPayload)).toBe(true);
  });

  it("false untuk role USER", () => {
    expect(isAdmin(userPayload)).toBe(false);
  });
});
