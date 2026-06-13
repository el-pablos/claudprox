// Test transform model: round-trip 52 model + invalid throw.

import { describe, it, expect } from "vitest";
import {
  MODEL_MAP,
  REVERSE_MODEL_MAP,
  toUpstreamModel,
  toUserModel,
  listUserModels,
} from "../lib/modelTransform.js";

describe("modelTransform", () => {
  it("mengekspos tepat 52 model user", () => {
    expect(listUserModels()).toHaveLength(52);
    expect(Object.keys(MODEL_MAP)).toHaveLength(52);
  });

  it("round-trip user -> upstream -> user untuk semua 52 model", () => {
    for (const userModel of listUserModels()) {
      const upstream = toUpstreamModel(userModel);
      expect(upstream.startsWith("kr/")).toBe(true);
      expect(toUserModel(upstream)).toBe(userModel);
    }
  });

  it("round-trip upstream -> user -> upstream untuk semua entry", () => {
    for (const upstreamModel of Object.keys(REVERSE_MODEL_MAP)) {
      const userModel = toUserModel(upstreamModel);
      expect(userModel).not.toBeNull();
      expect(toUpstreamModel(userModel as string)).toBe(upstreamModel);
    }
  });

  it("toUpstreamModel melempar error untuk model tak dikenal", () => {
    expect(() => toUpstreamModel("model-ngawur")).toThrow();
    expect(() => toUpstreamModel("kr/claude-haiku-4.5")).toThrow();
    expect(() => toUpstreamModel("")).toThrow();
  });

  it("toUserModel mengembalikan null untuk model upstream tak dikenal", () => {
    expect(toUserModel("kr/tidak-ada")).toBeNull();
    expect(toUserModel("gpt-4")).toBeNull();
  });

  it("contoh transform sesuai ENGINEERING.md (titik jadi strip)", () => {
    expect(toUpstreamModel("claude-haiku-4-5")).toBe("kr/claude-haiku-4.5");
    expect(toUpstreamModel("claude-opus-4-8")).toBe("kr/claude-opus-4.8");
    // Model tanpa titik tetap konsisten.
    expect(toUpstreamModel("claude-sonnet-4")).toBe("kr/claude-sonnet-4");
    expect(toUpstreamModel("glm-5-thinking")).toBe("kr/glm-5-thinking");
  });
});
